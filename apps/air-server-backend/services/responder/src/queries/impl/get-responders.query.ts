import { PaginationDto } from "@app/common";

export class GetRespondersQuery {
  constructor(
    public readonly tenantId: string,
    public readonly paginationDto: PaginationDto,
  ) {}
}
