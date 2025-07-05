import { NestFactory } from '@nestjs/core';
import { IngestionWorkerModule } from './ingestion-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(IngestionWorkerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
