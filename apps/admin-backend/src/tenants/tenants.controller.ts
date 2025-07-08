import { CommandBus } from "@nestjs/cqrs";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { CreateTenantCommand } from "./commands/impl/create-tenant.command";
import { AdminJwtGuard } from "src/guards/admin-jwt.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";

@UseGuards(AdminJwtGuard)
@Controller("tenants")
export class TenantsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<any> {
    return await this.commandBus.execute(
      new CreateTenantCommand(createTenantDto),
    );
  }
}
