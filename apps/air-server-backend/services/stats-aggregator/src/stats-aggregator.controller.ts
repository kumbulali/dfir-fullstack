import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateStatsCommand } from "./commands/impl/update-stats.command";

@Controller()
export class StatsAggregatorController {
  private readonly logger = new Logger(StatsAggregatorController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern("responder.created")
  handleResponderCreated(
    @Payload() data: { tenantId: string; responderId: number },
  ) {
    this.logger.debug(
      `'responder.created' event incoming: Tenant ${data.tenantId}`,
    );
    this.commandBus.execute(new UpdateStatsCommand("total_responders", 1));
  }

  @EventPattern("job.status.changed")
  handleJobStatusChanged(
    @Payload() data: { fromStatus: string; toStatus: string },
  ) {
    this.logger.log(
      `'job.status.changed' event incoming: ${data.fromStatus} -> ${data.toStatus}`,
    );

    if (data.fromStatus === "none") {
      this.commandBus.execute(new UpdateStatsCommand("total_jobs", 1));
    } else {
      this.commandBus.execute(
        new UpdateStatsCommand(`${data.fromStatus}_jobs`, -1),
      );
    }

    this.commandBus.execute(new UpdateStatsCommand(`${data.toStatus}_jobs`, 1));
  }
}
