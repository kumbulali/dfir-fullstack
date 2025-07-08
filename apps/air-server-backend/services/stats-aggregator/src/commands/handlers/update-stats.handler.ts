import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "@app/common/constants";
import { UpdateStatsCommand } from "../impl/update-stats.command";

@CommandHandler(UpdateStatsCommand)
export class UpdateStatsHandler implements ICommandHandler<UpdateStatsCommand> {
  private readonly logger = new Logger(UpdateStatsHandler.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async execute(command: UpdateStatsCommand): Promise<void> {
    const { field, value } = command;
    try {
      await this.redisClient.hincrby("global_stats", field, value);
      this.logger.debug(`Redis: field '${field}' updated.`);
    } catch (error) {
      this.logger.error(`Error occurred when updating redis counter:`, error);
    }
  }
}
