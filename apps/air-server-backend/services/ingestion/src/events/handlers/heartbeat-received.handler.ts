import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { HEARTBEAT_PERIOD, REDIS_CLIENT } from "@app/common/constants";
import { HeartbeatReceivedEvent } from "../impl/heartbeat-received.event";
import { ResponderStatus } from "@app/common";

@EventsHandler(HeartbeatReceivedEvent)
export class HeartbeatReceivedHandler
  implements IEventHandler<HeartbeatReceivedEvent>
{
  private readonly logger = new Logger(HeartbeatReceivedHandler.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async handle(event: HeartbeatReceivedEvent) {
    const { tenantId, responderId, os, ip } = event.payload;
    const redisKey = `tenant:${tenantId}:responder:${responderId}:health`;

    try {
      await this.redisClient.hset(redisKey, {
        status: ResponderStatus.HEALTHY,
        lastSeen: new Date().toISOString(),
        os,
        ip,
      });
      await this.redisClient.expire(redisKey, HEARTBEAT_PERIOD);
      this.logger.debug(
        `Event proccessed: Tenant ${tenantId}, Responder ${responderId}`,
      );
    } catch (error) {
      this.logger.error(
        `An error occurred when proccessing heartbeat for responder ${responderId}`,
        error,
      );
      throw error;
    }
  }
}
