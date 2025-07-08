import { CreateTenantDto } from "src/tenants/dtos/create-tenant.dto";

export class CreateTenantCommand {
  constructor(public readonly createTenantDto: CreateTenantDto) {}
}
