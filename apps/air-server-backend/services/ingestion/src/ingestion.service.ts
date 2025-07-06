import { Injectable, Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { RabbitSubscribe, Nack } from "@golevelup/nestjs-rabbitmq";
import { EventBus } from "@nestjs/cqrs";
import { HeartbeatReceivedEvent } from "./events/impl/heartbeat-received.event";
import { INGESTION_SERVICE } from "@app/common";
import { HeartbeatReceivedEventPayloadDto } from "./dtos/heartbeat-received-event-payload.dto";

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly eventBus: EventBus) {}

  @RabbitSubscribe({
    exchange: "health_exchange",
    routingKey: "heartbeat",
    queue: INGESTION_SERVICE,
    queueOptions: {
      durable: true,
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  public async handleHeartbeat(
    payload: HeartbeatReceivedEventPayloadDto,
  ): Promise<void | Nack> {
    this.logger.debug("Incoming heartbeat event from RabbitMQ:", payload);

    try {
      this.eventBus.publish(new HeartbeatReceivedEvent(payload.data));
    } catch (error) {
      this.logger.error("An error occurred when publishing event:", error);
      return new Nack(false);
    }
  }
}
