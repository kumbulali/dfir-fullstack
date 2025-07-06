import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { CommandBus } from "@nestjs/cqrs";
import { HeartbeatPayloadDto } from "./dtos/hearbeat-payload.dto";
import { ProcessHeartbeatCommand } from "./commands/impl/process-heartbeat.command";

@Controller()
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern("heartbeat")
  public async handleHeartbeat(
    @Payload() payload: HeartbeatPayloadDto,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.commandBus.execute(new ProcessHeartbeatCommand(payload));
      channel.ack(originalMsg);
    } catch (error) {
      console.error(error);
      this.logger.error(
        "Heartbeat işlenirken hata oluştu, mesaj yeniden kuyruğa alınmayacak.",
        error,
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
