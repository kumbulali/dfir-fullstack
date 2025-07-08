import { Controller, Get } from '@nestjs/common';
import { StatsAggregatorService } from './stats-aggregator.service';

@Controller()
export class StatsAggregatorController {
  constructor(private readonly statsAggregatorService: StatsAggregatorService) {}

  @Get()
  getHello(): string {
    return this.statsAggregatorService.getHello();
  }
}
