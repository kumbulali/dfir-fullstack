import { Controller, Get } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';

@Controller()
export class HeartbeatController {
  constructor(private readonly heartbeatService: HeartbeatService) {}

  @Get()
  getHello(): string {
    return this.heartbeatService.getHello();
  }
}
