import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { Transport } from "@nestjs/microservices";
import { JOB_SERVICE } from "@app/common";
import { ValidationPipe } from "@nestjs/common";
import { JobServiceModule } from "./job-service.module";

async function bootstrap() {
  const app = await NestFactory.create(JobServiceModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow("RABBITMQ_URI")],
      queue: JOB_SERVICE,
    },
  });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();
  await app.listen(configService.getOrThrow("PORT"));
}
bootstrap();
