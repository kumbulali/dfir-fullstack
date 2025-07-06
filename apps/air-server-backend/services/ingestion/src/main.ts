import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import * as amqp from "amqplib";
import { IngestionModule } from "./ingestion.module";
import { ConfigService } from "@nestjs/config";
import { INGESTION_SERVICE } from "@app/common";
import { Logger } from "nestjs-pino";

async function setupRabbitMQ(rabbitmqUrl: string, logger: Logger) {
  if (!rabbitmqUrl) {
    throw new Error("RABBITMQ_URI was not provided to setup function.");
  }

  const exchangeName = "health_exchange";
  const queueName = INGESTION_SERVICE;
  const routingKey = "heartbeat";

  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    logger.log(
      `Binding queue ${queueName} to exchange ${exchangeName} with key ${routingKey}`,
    );
    await channel.bindQueue(queueName, exchangeName, routingKey);

    await channel.close();
    await connection.close();
    logger.log("RabbitMQ topology setup successful.");
  } catch (error) {
    logger.error("Failed to setup RabbitMQ topology", error);
    process.exit(1);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule);
  const configService = app.get(ConfigService);
  const rabbitMqUri = configService.getOrThrow("RABBITMQ_URI");
  const logger = app.get(Logger);
  await setupRabbitMQ(rabbitMqUri, logger);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUri],
      queue: INGESTION_SERVICE,
      noAck: false,
    },
  });
  app.useLogger(logger);
  await app.startAllMicroservices();
}
bootstrap();
