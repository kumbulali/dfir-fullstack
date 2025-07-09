import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { CreateTenantCommand } from "./commands/impl/create-tenant.command";
import { AdminJwtGuard } from "src/guards/admin-jwt.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { PaginationDto, Tenant } from "@app/common";
import { GetTenantsQuery } from "./queries/impl/get-tenants.query";
import { GetTenantByIdQuery } from "./queries/impl/get-tenant-by-id.query";
import { UpdateTenantDto } from "./dtos/update-tenant.dto";
import { UpdateTenantCommand } from "./commands/impl/update-tenant.command";
import { DeleteTenantCommand } from "./commands/impl/delete-tenant.command";
import { GetTenantStatsQuery } from "./queries/impl/get-tenant-stats.query";

@UseGuards(AdminJwtGuard)
@Controller("tenants")
export class TenantsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<any> {
    return await this.commandBus.execute(
      new CreateTenantCommand(createTenantDto),
    );
  }

  @Get()
  async getTenants(
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ): Promise<Tenant[]> {
    return this.queryBus.execute(new GetTenantsQuery(paginationDto));
  }

  @Get(":id")
  async getTenant(@Param("id") id: string): Promise<Tenant> {
    return this.queryBus.execute(new GetTenantByIdQuery(id));
  }

  @Patch(":id")
  async updateTenant(
    @Param("id") id: string,
    @Body(ValidationPipe) updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return this.commandBus.execute(
      new UpdateTenantCommand(id, updateTenantDto),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTenant(@Param("id") id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTenantCommand(id));
  }

  @Get(":id/stats")
  async getTenantStats(@Param("id") id: string): Promise<{
    totalUsers: number;
    totalResponders: number;
    healthResponders: number;
    healthyRate: number;
  }> {
    return this.queryBus.execute(new GetTenantStatsQuery(id));
  }
}
