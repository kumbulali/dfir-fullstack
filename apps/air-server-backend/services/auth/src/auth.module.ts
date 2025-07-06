import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  HealthModule,
  JWT_EXPIRE,
  LoggerModule,
  MasterDatabaseModule,
  TenancyModule,
} from "@app/common";
import * as Joi from "joi";
import { CqrsModule } from "@nestjs/cqrs";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LoginUserQueryHandler } from "./queries/handlers/login-user.handler";
import { VerifyJwtQueryHandler } from "./queries/handlers/verify-jwt.handler";
import { LocalStrategy } from "./strategies/local.strategy";
import { VerifyResponderJwtQueryHandler } from "./queries/handlers/verify-responder-jwt.handler";

export const QueryHandlers = [
  LoginUserQueryHandler,
  VerifyJwtQueryHandler,
  VerifyResponderJwtQueryHandler,
];
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
        signOptions: { expiresIn: `${JWT_EXPIRE}m` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, ...QueryHandlers],
})
export class AuthModule {}
