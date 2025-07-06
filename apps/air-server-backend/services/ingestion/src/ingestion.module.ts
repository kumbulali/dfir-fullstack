import { Module } from "@nestjs/common";
import { LoggerModule, REDIS_CLIENT } from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import Redis from "ioredis";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { IngestionService } from "./ingestion.service";
import { HeartbeatReceivedHandler } from "./events/handlers/heartbeat-received.handler";

export const EventHandlers = [HeartbeatReceivedHandler];
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
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          exchanges: [
            {
              name: "health_exchange",
              type: "direct",
              durable: true,
            },
          ],
          uri: configService.getOrThrow<string>("RABBITMQ_URI"),
          connectionInitOptions: { wait: false },
        };
      },
    }),
  ],
  providers: [
    IngestionService,
    ...EventHandlers,
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
