import { Module } from "@nestjs/common";
import { SyncService } from "./sync.service";
import {
  LoggerModule,
  MasterDatabaseModule,
  REDIS_CLIENT,
  RESPONDER_SERVICE,
  TenancyModule,
} from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import Redis from "ioredis";
import { ScheduleModule } from "@nestjs/schedule";
import { CqrsModule } from "@nestjs/cqrs";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { SyncHeartbeatsCommandHandler } from "./commands/handlers/sync-heartbeats.handler";

export const CommandHandlers = [SyncHeartbeatsCommandHandler];

@Module({
  imports: [
    LoggerModule,
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        RABBITMQ_URI: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: RESPONDER_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>("RABBITMQ_URI")],
            queue: RESPONDER_SERVICE,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    MasterDatabaseModule,
    TenancyModule.register(),
    ScheduleModule.forRoot(),
  ],
  providers: [
    ...CommandHandlers,
    SyncService,
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
export class SyncModule {}
