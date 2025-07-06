import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "@app/common/constants";
import { ProcessHeartbeatCommand } from "../impl/process-heartbeat.command";
import { ResponderStatus } from "@app/common";

@CommandHandler(ProcessHeartbeatCommand)
export class ProcessHeartbeatCommandHandler
  implements ICommandHandler<ProcessHeartbeatCommand>
{
  private readonly logger = new Logger(ProcessHeartbeatCommandHandler.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async execute(command: ProcessHeartbeatCommand): Promise<void> {
    const { tenantId, responderId } = command.payload;
    const redisKey = `tenant:${tenantId}:responder:${responderId}:health`;
    try {
      await this.redisClient.hset(redisKey, {
        status: ResponderStatus.HEALTHY,
        lastSeen: new Date().toISOString(),
      });
      await this.redisClient.expire(redisKey, 300);
      this.logger.debug(
        `Heartbeat işlendi: Tenant ${tenantId}, Responder ${responderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Responder ${responderId} için heartbeat işlenirken hata oluştu:`,
        error,
      );
    }
  }
}
