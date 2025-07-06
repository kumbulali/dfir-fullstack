import { Controller, Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { CommandBus } from "@nestjs/cqrs";
import { BatchUpdateRespondersCommand } from "./commands/impl/batch-update-responders.command";
import { BatchUpdatePayloadDto } from "./dtos/batch-update-payload.dto";

@Controller()
export class ResponderHealthController {
  private readonly logger = new Logger(ResponderHealthController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern("batch_update_responders")
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleBatchUpdate(@Payload() data: BatchUpdatePayloadDto) {
    this.logger.log(`Batch update init for tenant ${data.tenantId}.`);
    await this.commandBus.execute(
      new BatchUpdateRespondersCommand(data.tenantId, data.updates),
    );
  }
}
