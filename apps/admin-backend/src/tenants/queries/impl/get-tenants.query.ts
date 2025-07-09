import { PaginationDto } from "@app/common";

export class GetTenantsQuery {
  constructor(public readonly paginationDto: PaginationDto) {}
}
