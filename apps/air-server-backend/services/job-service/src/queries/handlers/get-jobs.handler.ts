import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetJobsQuery } from "../impl/get-jobs.query";
import { Job, TenantConnectionManager } from "@app/common";

@QueryHandler(GetJobsQuery)
export class GetJobsQueryHandler implements IQueryHandler<GetJobsQuery> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(query: GetJobsQuery) {
    const { tenantId, paginationDto } = query;
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 10;

    const connection = await this.tenantManager.getConnection(tenantId);
    const jobRepository = connection.getRepository(Job);

    const [data, total] = await jobRepository.findAndCount({
      relations: ["responder"],
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
