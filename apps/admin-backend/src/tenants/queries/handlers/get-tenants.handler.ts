import {
  QueryHandler,
  IQueryHandler as IQueryHandlerTenants,
} from "@nestjs/cqrs";
import { GetTenantsQuery } from "../impl/get-tenants.query";
import { MASTER_DB_CONNECTION, Tenant } from "@app/common";
import { Inject } from "@nestjs/common";
import { DataSource } from "typeorm";

@QueryHandler(GetTenantsQuery)
export class GetTenantsQueryHandler
  implements IQueryHandlerTenants<GetTenantsQuery>
{
  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async execute(query: GetTenantsQuery) {
    const { paginationDto } = query;
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;

    const tenantRepository = this.masterConnection.getRepository(Tenant);

    const [data, total] = await tenantRepository.findAndCount({
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }
}
