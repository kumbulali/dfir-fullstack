import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  HealthModule,
  LoggerModule,
  MasterDatabaseModule,
  TenancyModule,
} from "@app/common";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LoginUserQueryHandler } from "./queries/handlers/login-user.handler";
import { LocalStrategy } from "./strategies/local.strategy";
import { MqttAuthModule } from "./mqtt-auth/mqtt-auth.module";

export const QueryHandlers = [LoginUserQueryHandler];
@Module({
  imports: [
    HealthModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000).required(),
        RABBITMQ_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    MasterDatabaseModule,
    TenancyModule.register(),
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow("JWT_SECRET"),
        signOptions: { expiresIn: "60m" },
      }),
    }),
    MqttAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, ...QueryHandlers],
})
export class AuthModule {}
