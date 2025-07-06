import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CommandBus } from "@nestjs/cqrs";
import { SyncHeartbeatsCommand } from "./commands/impl/sync-heartbeats.command";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private isSyncing = false;

  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    if (this.isSyncing) {
      this.logger.warn("Recent update still processing skipping iteration.");
      return;
    }

    this.isSyncing = true;
    try {
      await this.commandBus.execute(new SyncHeartbeatsCommand());
    } finally {
      this.isSyncing = false;
    }
  }
}
