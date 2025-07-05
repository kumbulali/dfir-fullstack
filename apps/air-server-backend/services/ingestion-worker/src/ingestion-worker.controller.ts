import { Controller, Get } from '@nestjs/common';
import { IngestionWorkerService } from './ingestion-worker.service';

@Controller()
export class IngestionWorkerController {
  constructor(private readonly ingestionWorkerService: IngestionWorkerService) {}

  @Get()
  getHello(): string {
    return this.ingestionWorkerService.getHello();
  }
}
