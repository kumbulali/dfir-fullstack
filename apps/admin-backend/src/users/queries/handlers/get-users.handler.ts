import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { GetUsersQuery } from "../impl/get-users.query";
import { TenantConnectionManager, User } from "@app/common";

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(query: GetUsersQuery) {
    const { tenantId, paginationDto } = query;
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;

    const connection = await this.tenantManager.getConnection(tenantId);
    const userRepository = connection.getRepository(User);

    const [data, total] = await userRepository.findAndCount({
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
