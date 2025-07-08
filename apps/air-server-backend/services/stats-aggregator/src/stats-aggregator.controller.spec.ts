import { Test, TestingModule } from '@nestjs/testing';
import { StatsAggregatorController } from './stats-aggregator.controller';
import { StatsAggregatorService } from './stats-aggregator.service';

describe('StatsAggregatorController', () => {
  let statsAggregatorController: StatsAggregatorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StatsAggregatorController],
      providers: [StatsAggregatorService],
    }).compile();

    statsAggregatorController = app.get<StatsAggregatorController>(StatsAggregatorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(statsAggregatorController.getHello()).toBe('Hello World!');
    });
  });
});
