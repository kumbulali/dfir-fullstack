import { PaginationDto } from "@app/common";

export class GetJobsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly paginationDto: PaginationDto,
  ) {}
}
