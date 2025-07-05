import { Module } from '@nestjs/common';
import { MqttAuthService } from './mqtt-auth.service';
import { MqttAuthController } from './mqtt-auth.controller';

@Module({
  providers: [MqttAuthService],
  controllers: [MqttAuthController]
})
export class MqttAuthModule {}
