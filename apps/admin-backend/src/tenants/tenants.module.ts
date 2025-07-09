import { Module } from "@nestjs/common";
import { TenantsController } from "./tenants.controller";
import { CreateTenantHandler } from "./commands/handlers/create-tenant.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { GetTenantsQueryHandler } from "./queries/handlers/get-tenants.handler";
import { GetTenantByIdQueryHandler } from "./queries/handlers/get-tenant-by-id.handler";
import { UpdateTenantHandler } from "./commands/handlers/update-tenant.handler";
import { DeleteTenantHandler } from "./commands/handlers/delete-tenant.handler";
import { GetTenantStatsQueryHandler } from "./queries/handlers/get-tenant-stats.handler";

export const CommandHandlers = [
  CreateTenantHandler,
  UpdateTenantHandler,
  DeleteTenantHandler,
];

export const QueryHandlers = [
  GetTenantsQueryHandler,
  GetTenantByIdQueryHandler,
  GetTenantStatsQueryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [TenantsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class TenantsModule {}
