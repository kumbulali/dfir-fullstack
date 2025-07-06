import { NestFactory } from "@nestjs/core";
import { IngestionModule } from "./ingestion.module";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule);
  app.useLogger(app.get(Logger));
  await app.init();
}
bootstrap();
