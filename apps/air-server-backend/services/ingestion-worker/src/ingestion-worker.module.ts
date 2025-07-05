import { Module } from '@nestjs/common';
import { IngestionWorkerController } from './ingestion-worker.controller';
import { IngestionWorkerService } from './ingestion-worker.service';

@Module({
  imports: [],
  controllers: [IngestionWorkerController],
  providers: [IngestionWorkerService],
})
export class IngestionWorkerModule {}
