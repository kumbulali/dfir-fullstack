import { NestFactory } from "@nestjs/core";
import { StatsAggregatorModule } from "./stats-aggregator.module";
import { ConfigService } from "@nestjs/config";
import { Transport } from "@nestjs/microservices";
import { Logger } from "nestjs-pino";
import { ValidationPipe } from "@nestjs/common";
import { STATS_AGGREGATOR_SERVICE } from "@app/common";

async function bootstrap() {
  const app = await NestFactory.create(StatsAggregatorModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow("RABBITMQ_URI")],
      queue: STATS_AGGREGATOR_SERVICE,
    },
  });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();
}
bootstrap();
