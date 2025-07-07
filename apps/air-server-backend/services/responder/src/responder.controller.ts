import {
  Controller,
  Post,
  Body,
  Headers,
  Ip,
  UseGuards,
  Get,
  Query,
  ValidationPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
  Delete,
  Param,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterResponderCommand } from "./commands/impl/register-responder.command";
import { RegisterResponderDto } from "./dtos/register-responder.dto";
import { CreateEnrollmentTokenCommand } from "./commands/impl/create-enrollment-token.command";
import { JwtAuthGuard, PaginationDto, TenantGuard } from "@app/common";
import { GetRespondersQuery } from "./queries/impl/get-responders.query";
import { DeregisterResponderCommand } from "./commands/impl/deregister-responder.command";

@Controller("responders")
export class ResponderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async deregisterResponder(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") responderId: number,
  ) {
    return this.commandBus.execute(
      new DeregisterResponderCommand(tenantId, responderId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getResponders(
    @Headers("x-tenant-id") tenantId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    return this.queryBus.execute(
      new GetRespondersQuery(tenantId, paginationDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("token")
  async createToken(@Headers("x-tenant-id") tenantId: string) {
    return this.commandBus.execute(new CreateEnrollmentTokenCommand(tenantId));
  }
}
