import { PaginationDto } from "@app/common";

export class GetUsersQuery {
  constructor(
    public readonly tenantId: string,
    public readonly paginationDto: PaginationDto,
  ) {}
}
