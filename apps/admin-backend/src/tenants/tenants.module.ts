import { Module } from "@nestjs/common";
import { TenantsController } from "./tenants.controller";
import { CreateTenantHandler } from "./commands/handlers/create-tenant.handler";
import { CqrsModule } from "@nestjs/cqrs";

export const CommandHandlers = [CreateTenantHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TenantsController],
  providers: [...CommandHandlers],
})
export class TenantsModule {}
