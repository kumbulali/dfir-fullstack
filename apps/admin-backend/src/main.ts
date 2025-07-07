import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(configService.getOrThrow("PORT"));
}
bootstrap();
