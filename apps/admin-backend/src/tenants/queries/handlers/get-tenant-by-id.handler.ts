import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTenantByIdQuery } from "../impl/get-tenant-by-id.query";
import { MASTER_DB_CONNECTION, Tenant } from "@app/common";
import { Inject, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@QueryHandler(GetTenantByIdQuery)
export class GetTenantByIdQueryHandler
  implements IQueryHandler<GetTenantByIdQuery>
{
  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async execute(query: GetTenantByIdQuery): Promise<Tenant> {
    const { tenantId } = query;
    const tenantRepository = this.masterConnection.getRepository(Tenant);

    const tenant = await tenantRepository.findOneBy({ id: tenantId });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found.`);
    }

    return tenant;
  }
}
