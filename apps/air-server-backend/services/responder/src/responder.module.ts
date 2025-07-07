import { Module } from "@nestjs/common";
import { ResponderController } from "./responder.controller";
import { EmqxService } from "./emqx.service";
import {
  AUTH_SERVICE,
  HealthModule,
  JOB_SERVICE,
  LoggerModule,
  MasterDatabaseModule,
  TenancyModule,
} from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { RegisterResponderHandler } from "./commands/handlers/register-responder.command.handler";
import { HttpModule } from "@nestjs/axios";
import { CreateEnrollmentTokenHandler } from "./commands/handlers/create-enrollment-token.handler";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ResponderHealthController } from "./responder-health.controller";
import { BatchUpdateRespondersHandler } from "./commands/handlers/batch-update-responders.handler";
import { GetRespondersQueryHandler } from "./queries/handlers/get-responders.handler";
import { DeregisterResponderHandler } from "./commands/handlers/deregister-responder.handler";
import { MqttModule } from "services/job-service/src/mqtt/mqtt.module";

export const CommandHandlers = [
  RegisterResponderHandler,
  CreateEnrollmentTokenHandler,
  BatchUpdateRespondersHandler,
  DeregisterResponderHandler,
];

export const QueryHandlers = [GetRespondersQueryHandler];

@Module({
  imports: [
    HealthModule,
    LoggerModule,
    HttpModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000).required(),
        RABBITMQ_URI: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        EMQX_API_URL: Joi.string().required(),
        EMQX_API_USER: Joi.string().required(),
        EMQX_API_PASSWORD: Joi.string().required(),
        EMQX_MQTT_URL: Joi.string().required(),
        EMQX_MQTT_USER: Joi.string().required(),
        EMQX_MQTT_PASSWORD: Joi.string().required(),
      }),
    }),
    MasterDatabaseModule,
    TenancyModule.register(),
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>("RABBITMQ_URI")],
            queue: AUTH_SERVICE,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: JOB_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>("RABBITMQ_URI")],
            queue: JOB_SERVICE,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    MqttModule.register(),
  ],
  controllers: [ResponderController, ResponderHealthController],
  providers: [EmqxService, ...CommandHandlers, ...QueryHandlers],
})
export class ResponderModule {}
