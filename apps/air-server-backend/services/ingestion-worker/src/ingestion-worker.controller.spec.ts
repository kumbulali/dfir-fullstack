import { Test, TestingModule } from '@nestjs/testing';
import { IngestionWorkerController } from './ingestion-worker.controller';
import { IngestionWorkerService } from './ingestion-worker.service';

describe('IngestionWorkerController', () => {
  let ingestionWorkerController: IngestionWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IngestionWorkerController],
      providers: [IngestionWorkerService],
    }).compile();

    ingestionWorkerController = app.get<IngestionWorkerController>(IngestionWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ingestionWorkerController.getHello()).toBe('Hello World!');
    });
  });
});
