import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { DataSource } from "typeorm";
import { GetDashboardStatsQuery } from "../impl/get-dashboard-stats.query";
import { GlobalStats } from "@app/common/entities/global-stats.entity";
import { MASTER_DB_CONNECTION } from "@app/common";

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler
  implements IQueryHandler<GetDashboardStatsQuery>
{
  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async execute(): Promise<GlobalStats | object> {
    const statsRepository = this.masterConnection.getRepository(GlobalStats);

    const stats = await statsRepository.findOneBy({ id: 1 });

    if (!stats) {
      return { message: "No statistics have been aggregated yet." };
    }

    return stats;
  }
}
