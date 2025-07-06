import { Module } from "@nestjs/common";
import { ProcessHeartbeatCommandHandler } from "./commands/handlers/process-heartbeat.handler";
import { LoggerModule, REDIS_CLIENT } from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { IngestionController } from "./ingestion.controller";
import Redis from "ioredis";

export const CommandHandlers = [ProcessHeartbeatCommandHandler];

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBITMQ_URI: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    CqrsModule,
  ],
  controllers: [IngestionController],
  providers: [
    ...CommandHandlers,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        return new Redis({
          host: config.get("REDIS_HOST"),
          port: config.get<number>("REDIS_PORT"),
        });
      },
    },
  ],
})
export class IngestionModule {}
