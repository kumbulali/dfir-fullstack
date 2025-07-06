import { Module } from "@nestjs/common";
import { ResponderController } from "./responder.controller";
import { EmqxService } from "./emqx.service";
import {
  HealthModule,
  LoggerModule,
  MasterDatabaseModule,
  TenancyModule,
} from "@app/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { RegisterResponderHandler } from "./commands/handlers/register-responder.command.handler";
import { HttpModule } from "@nestjs/axios";
import { CreateEnrollmentTokenHandler } from "./commands/handlers/create-enrollment-token.handler";

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
      }),
    }),
    MasterDatabaseModule,
    TenancyModule.register(),
    CqrsModule,
  ],
  controllers: [ResponderController],
  providers: [EmqxService, ...CommandHandlers],
})
export class ResponderModule {}
