import { REDIS_CLIENT, RESPONDER_SERVICE } from "@app/common";
import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";
import Redis from "ioredis";
import { UpdatesByTenant } from "../../types/updates-by-tenant.type";
import { Readable } from "typeorm/platform/PlatformTools";
import { SyncHeartbeatsCommand } from "../impl/sync-heartbeats.command";

@CommandHandler(SyncHeartbeatsCommand)
export class SyncHeartbeatsCommandHandler
  implements ICommandHandler<SyncHeartbeatsCommand>
{
  private readonly logger = new Logger(SyncHeartbeatsCommand.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(RESPONDER_SERVICE) private readonly responderClient: ClientProxy,
  ) {}

  async execute(): Promise<void> {
    this.logger.log("CQRS: Redis -> PostgreSQL sync starting...");

    try {
      const updates = await this.collectUpdatesFromRedis();
      if (updates.size > 0) {
        await this.delegateUpdatesToResponderService(updates);
      } else {
        this.logger.log("No data found for update.");
      }
    } catch (error) {
      this.logger.error("An error occurred when syncing:", error);
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
        if (!Array.isArray(keys) || keys.length === 0) return;

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
            `Redis scan completed. Updates found for ${updatesByTenant.size} tenant(s).`,
          );
          resolve(updatesByTenant);
        } catch (error) {
          reject(error);
        }
      });

      stream.on("error", (err) => {
        this.logger.error("An error occured on redis scan: ", err);
        reject(err);
      });
    });
  }

  private async delegateUpdatesToResponderService(
    updates: UpdatesByTenant,
  ): Promise<void> {
    this.logger.log(
      `Batch update event is sending to responder service for ${updates.size} tenant(s).`,
    );
    for (const [tenantId, responderUpdates] of updates.entries()) {
      const payload = {
        tenantId: tenantId,
        updates: responderUpdates,
      };
      this.responderClient.emit("batch_update_responders", payload);
    }
  }
}
