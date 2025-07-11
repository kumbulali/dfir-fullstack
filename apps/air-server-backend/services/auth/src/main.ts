import { NestFactory } from "@nestjs/core";
import { AuthModule } from "./auth.module";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { Transport } from "@nestjs/microservices";
import { AUTH_SERVICE } from "@app/common";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow("RABBITMQ_URI")],
      queue: AUTH_SERVICE,
    },
  });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(configService.getOrThrow("PORT"));
}
bootstrap();
