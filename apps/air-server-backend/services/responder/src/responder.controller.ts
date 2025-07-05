import { Controller, Post, Body, Headers, Ip } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RegisterResponderCommand } from "./commands/impl/register-responder.command";
import { RegisterResponderDto } from "./dtos/register-responder.dto";

@Controller("responders")
export class ResponderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("register")
  async register(
    @Headers("x-tenant-id") tenantId: string,
    @Body() registerDto: RegisterResponderDto,
    @Ip() ipAddress: string,
  ) {
    return this.commandBus.execute(
      new RegisterResponderCommand(tenantId, registerDto, ipAddress),
    );
  }
}
