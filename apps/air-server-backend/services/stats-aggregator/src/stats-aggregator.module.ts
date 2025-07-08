import { Module } from "@nestjs/common";
import { StatsAggregatorController } from "./stats-aggregator.controller";
import { StatsAggregatorService } from "./stats-aggregator.service";
import { LoggerModule, MasterDatabaseModule, REDIS_CLIENT } from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import Redis from "ioredis";

export const CommandHandlers = [];

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
    MasterDatabaseModule,
    CqrsModule,
  ],
  controllers: [StatsAggregatorController],
  providers: [
    StatsAggregatorService,
    ...CommandHandlers,
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
