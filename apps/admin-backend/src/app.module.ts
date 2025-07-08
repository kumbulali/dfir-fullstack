import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { HealthModule, LoggerModule, MasterDatabaseModule } from "@app/common";
import { AuthModule } from "./auth/auth.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { SeederModule } from "./seeders/seeder.module";
import { TenantsModule } from "./tenants/tenants.module";

@Module({
  imports: [
    HealthModule,
    MasterDatabaseModule,
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
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    AuthModule,
    AdminUsersModule,
    SeederModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
