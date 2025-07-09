import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DataSource } from "typeorm";
// import { GlobalStats } from '@app/common/stats/global-stats.entity';
import { MASTER_DB_CONNECTION, REDIS_CLIENT } from "@app/common/constants";
import Redis from "ioredis";
import { GlobalStats, Tenant } from "@app/common";
import { Readable } from "stream";

@Injectable()
export class StatsAggregatorService {
  private readonly logger = new Logger(StatsAggregatorService.name);
  private readonly statsKey = "global_stats";

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug("Redis -> PostgreSQL stat sync starting...");

    try {
      const healthyCount = await this.countHealthyResponders();
      await this.redisClient.hset(
        this.statsKey,
        "healthy_responders",
        healthyCount,
      );
      this.logger.debug(
        `Total healthy responder count updated as ${healthyCount}.`,
      );
    } catch (error) {
      this.logger.error(
        "An error occurred when calculating healthy responders:",
        error,
      );
    }

    const statsFromRedis = await this.redisClient.hgetall(this.statsKey);

    if (Object.keys(statsFromRedis).length === 0) {
      this.logger.log("No data found to synchronize.");
      return;
    }

    const tenantsRepo = this.masterConnection.getRepository(Tenant);
    const totalTenantCount = await tenantsRepo.count();

    const statsToSave: Partial<GlobalStats> = {
      id: 1, // FOR UPDATE SAME ROW
      totalTenants: totalTenantCount || 0,
      totalResponders: parseInt(statsFromRedis.total_responders, 10) || 0,
      healthyResponders: parseInt(statsFromRedis.healthy_responders, 10) || 0,
      totalJobs: parseInt(statsFromRedis.total_jobs, 10) || 0,
      pendingJobs: parseInt(statsFromRedis.pending_jobs, 10) || 0,
      completedJobs: parseInt(statsFromRedis.completed_jobs, 10) || 0,
      failedJobs: parseInt(statsFromRedis.failed_jobs, 10) || 0,
    };

    const statsRepo = this.masterConnection.getRepository(GlobalStats);
    await statsRepo.save(statsToSave);

    this.logger.debug("Stats synced successfully.");
  }

  private countHealthyResponders(): Promise<number> {
    const stream: Readable = this.redisClient.scanStream({
      match: "tenant:*:responder:*:health",
      count: 1000,
    });

    let count = 0;
    return new Promise((resolve, reject) => {
      stream.on("data", (keys: string[]) => {
        if (Array.isArray(keys)) {
          count += keys.length;
        }
      });
      stream.on("end", () => resolve(count));
      stream.on("error", (err) => reject(err));
    });
  }
}
