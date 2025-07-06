import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { SyncModule } from "./sync.module";

async function bootstrap() {
  const app = await NestFactory.create(SyncModule);
  app.useLogger(app.get(Logger));
  await app.init();
}
bootstrap();
