import {
  REDIS_CLIENT,
  Responder,
  ResponderStatus,
  TenantConnectionManager,
} from "@app/common";
import { Injectable, Inject, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Redis } from "ioredis";
import { Readable } from "stream";
import { UpdatesByTenant } from "./types/updates-by-tenant.type";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private isSyncing = false;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly tenantManager: TenantConnectionManager,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    if (this.isSyncing) {
      this.logger.warn("Last sync still proccessing, this iteration skipping.");
      return;
    }

    this.isSyncing = true;
    this.logger.log("Redis -> PostgreSQL sync starting...");

    try {
      const updates = await this.collectUpdatesFromRedis();
      if (updates.size === 0) {
        this.logger.log("No new data found for sync.");
        return;
      }

      await this.syncUpdatesToDatabases(updates);
    } catch (error) {
      this.logger.error(
        "An error occurred when proccessing last seen sync:",
        error,
      );
    } finally {
      this.isSyncing = false;
      this.logger.log("Last seen sync completed.");
    }
  }

  private collectUpdatesFromRedis(): Promise<UpdatesByTenant> {
    const updatesByTenant: UpdatesByTenant = new Map();
    const stream: Readable = this.redisClient.scanStream({
      match: "tenant:*:responder:*:health",
      count: 100,
    });

    return new Promise((resolve, reject) => {
      const processingPromises: Promise<void>[] = [];

      stream.on("data", (keys: string[]) => {
        if (!Array.isArray(keys) || keys.length === 0) {
          return;
        }

        const promise = (async () => {
          for (const key of keys) {
            const [, tenantId, , responderIdStr] = key.split(":");
            const responderId = parseInt(responderIdStr, 10);

            const data = await this.redisClient.hgetall(key);
            if (data.lastSeen) {
              if (!updatesByTenant.has(tenantId)) {
                updatesByTenant.set(tenantId, []);
              }
              updatesByTenant.get(tenantId)!.push({
                id: responderId,
                lastSeen: new Date(data.lastSeen),
              });
            }
          }
        })();
        processingPromises.push(promise);
      });

      stream.on("end", async () => {
        try {
          await Promise.all(processingPromises);
          this.logger.log(
            `Redis check completed. ${updatesByTenant.size} tenant(s) found.`,
          );
          resolve(updatesByTenant);
        } catch (error) {
          reject(error);
        }
      });

      stream.on("error", (err) => {
        this.logger.error("Redis scan stream sırasında bir hata oluştu:", err);
        reject(err);
      });
    });
  }

  private async syncUpdatesToDatabases(
    updates: UpdatesByTenant,
  ): Promise<void> {
    for (const [tenantId, responderUpdates] of updates.entries()) {
      try {
        const connection = await this.tenantManager.getConnection(tenantId);
        const responderRepo = connection.getRepository(Responder);

        await responderRepo.save(
          responderUpdates.map((update) => ({
            id: update.id,
            lastSeen: update.lastSeen,
            status: ResponderStatus.HEALTHY,
          })),
          { chunk: 100 },
        );

        this.logger.log(
          `${responderUpdates.length} responder updated for tenant ${tenantId}.`,
        );
      } catch (error) {
        this.logger.error(`Sync failed for tenant ${tenantId}.`, error);
      }
    }
  }
}
