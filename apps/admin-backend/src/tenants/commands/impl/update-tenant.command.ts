import { UpdateTenantDto } from "src/tenants/dtos/update-tenant.dto";

export class UpdateTenantCommand {
  constructor(
    public readonly tenantId: string,
    public readonly updateTenantDto: UpdateTenantDto,
  ) {}
}
