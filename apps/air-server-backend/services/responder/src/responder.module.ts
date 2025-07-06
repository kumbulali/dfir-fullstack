import { Module } from "@nestjs/common";
import { ResponderController } from "./responder.controller";
import { EmqxService } from "./emqx.service";
import {
  AUTH_SERVICE,
  HealthModule,
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

export const CommandHandlers = [
  RegisterResponderHandler,
  CreateEnrollmentTokenHandler,
];

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
    ]),
  ],
  controllers: [ResponderController],
  providers: [EmqxService, ...CommandHandlers],
})
export class ResponderModule {}
