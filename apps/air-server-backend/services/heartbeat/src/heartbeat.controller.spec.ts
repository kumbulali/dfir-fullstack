import { Test, TestingModule } from '@nestjs/testing';
import { HeartbeatController } from './heartbeat.controller';
import { HeartbeatService } from './heartbeat.service';

describe('HeartbeatController', () => {
  let heartbeatController: HeartbeatController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HeartbeatController],
      providers: [HeartbeatService],
    }).compile();

    heartbeatController = app.get<HeartbeatController>(HeartbeatController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(heartbeatController.getHello()).toBe('Hello World!');
    });
  });
});
