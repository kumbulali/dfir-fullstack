import { Module } from "@nestjs/common";
import { StatsAggregatorController } from "./stats-aggregator.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { LoggerModule, MasterDatabaseModule, REDIS_CLIENT } from "@app/common";
import { UpdateStatsHandler } from "./commands/handlers/update-stats.handler";
import Redis from "ioredis";
import { ScheduleModule } from "@nestjs/schedule";
import { StatsAggregatorService } from "./stats-aggregator.service";

export const CommandHandlers = [UpdateStatsHandler];

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBITMQ_URI: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    CqrsModule,
    MasterDatabaseModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [StatsAggregatorController],
  providers: [
    ...CommandHandlers,
    StatsAggregatorService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        return new Redis({
          host: config.getOrThrow<string>("REDIS_HOST"),
          port: config.getOrThrow<number>("REDIS_PORT"),
        });
      },
    },
  ],
})
export class StatsAggregatorModule {}
