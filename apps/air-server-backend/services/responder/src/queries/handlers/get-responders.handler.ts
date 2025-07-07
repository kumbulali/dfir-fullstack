import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetRespondersQuery } from "../impl/get-responders.query";
import { Responder, TenantConnectionManager } from "@app/common";

@QueryHandler(GetRespondersQuery)
export class GetRespondersQueryHandler
  implements IQueryHandler<GetRespondersQuery>
{
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(query: GetRespondersQuery) {
    const { tenantId, paginationDto } = query;

    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;

    const connection = await this.tenantManager.getConnection(tenantId);
    const responderRepository = connection.getRepository(Responder);

    const [data, total] = await responderRepository.findAndCount({
      order: {
        createdAt: "DESC",
      },
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
