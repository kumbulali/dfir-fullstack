import { NestFactory } from '@nestjs/core';
import { HeartbeatModule } from './heartbeat.module';

async function bootstrap() {
  const app = await NestFactory.create(HeartbeatModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
