import { Test, TestingModule } from '@nestjs/testing';
import { MqttAuthService } from './mqtt-auth.service';

describe('MqttAuthService', () => {
  let service: MqttAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MqttAuthService],
    }).compile();

    service = module.get<MqttAuthService>(MqttAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
