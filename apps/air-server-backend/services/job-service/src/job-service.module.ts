import { Module } from "@nestjs/common";
import {
  AUTH_SERVICE,
  HealthModule,
  LoggerModule,
  MasterDatabaseModule,
  MqttModule,
  TenancyModule,
} from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { JobServiceController } from "./job-service.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AssignJobHandler } from "./commands/handlers/assign-job.handler";
import { SubmitJobResultHandler } from "./commands/handlers/submit-job-result.handler";
import { GetJobsQueryHandler } from "./queries/handlers/get-jobs.handler";
import { DeleteResponderJobsCommandHandler } from "./commands/handlers/delete-responder-jobs.handler";

export const CommandHandlers = [
  AssignJobHandler,
  SubmitJobResultHandler,
  DeleteResponderJobsCommandHandler,
];
export const QueryHandlers = [GetJobsQueryHandler];

@Module({
  imports: [
    HealthModule,
    LoggerModule,
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
    ]),
    MqttModule.register(),
  ],
  controllers: [JobServiceController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class JobServiceModule {}
