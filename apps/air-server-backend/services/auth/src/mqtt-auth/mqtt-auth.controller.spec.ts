import { Test, TestingModule } from '@nestjs/testing';
import { MqttAuthController } from './mqtt-auth.controller';

describe('MqttAuthController', () => {
  let controller: MqttAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MqttAuthController],
    }).compile();

    controller = module.get<MqttAuthController>(MqttAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
