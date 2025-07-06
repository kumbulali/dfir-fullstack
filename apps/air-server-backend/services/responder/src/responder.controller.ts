import { Controller, Post, Body, Headers, Ip, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RegisterResponderCommand } from "./commands/impl/register-responder.command";
import { RegisterResponderDto } from "./dtos/register-responder.dto";
import { CreateEnrollmentTokenCommand } from "./commands/impl/create-enrollment-token.command";
import { TenantGuard } from "@app/common";

@Controller("responders")
export class ResponderController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(TenantGuard)
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

  @UseGuards(TenantGuard)
  @Post("token")
  async createToken(@Headers("x-tenant-id") tenantId: string) {
    return this.commandBus.execute(new CreateEnrollmentTokenCommand(tenantId));
  }
}
