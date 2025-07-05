import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { MqttAuthService } from "./mqtt-auth.service";
import { MqttAuthRequest } from "./interfaces/mqtt-auth-request.interface";
import { MqttAclRequest } from "./interfaces/mqtt-acl-request.interface";

@Controller("mqtt")
export class MqttAuthController {
  constructor(private readonly mqttAuthService: MqttAuthService) {}

  @Post("auth")
  async authenticate(@Body() authRequest: MqttAuthRequest) {
    const isValid = await this.mqttAuthService.validateResponder(
      authRequest.username,
      authRequest.password,
    );

    if (!isValid) {
      throw new UnauthorizedException();
    }
  }

  @Post("acl")
  async authorize(@Body() aclRequest: MqttAclRequest) {
    const isAllowed = this.mqttAuthService.checkPermissions(
      aclRequest.username,
      aclRequest.topic,
      aclRequest.action,
    );

    if (!isAllowed) {
      throw new ForbiddenException();
    }
  }
}
