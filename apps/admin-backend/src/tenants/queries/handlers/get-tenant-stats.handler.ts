import {
  IQueryHandler as IQueryHandlerTenantStats,
  QueryHandler,
} from "@nestjs/cqrs";
import { GetTenantStatsQuery } from "../impl/get-tenant-stats.query";
import { MoreThan } from "typeorm";
import { Responder, TenantConnectionManager, User } from "@app/common";

@QueryHandler(GetTenantStatsQuery)
export class GetTenantStatsQueryHandler
  implements IQueryHandlerTenantStats<GetTenantStatsQuery>
{
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(query: GetTenantStatsQuery) {
    const { tenantId } = query;
    const connection = await this.tenantManager.getConnection(tenantId);

    const userRepo = connection.getRepository(User);
    const responderRepo = connection.getRepository(Responder);

    const totalUsers = await userRepo.count();
    const totalResponders = await responderRepo.count();

    const fortyFiveSecondsAgo = new Date(Date.now() - 45 * 1000);

    const healthyResponders = await responderRepo.count({
      where: {
        lastSeen: MoreThan(fortyFiveSecondsAgo),
      },
    });

    const healthyRate =
      totalResponders > 0 ? (healthyResponders / totalResponders) * 100 : 0;

    return {
      totalUsers,
      totalResponders,
      healthyResponders,
      healthyRate: parseFloat(healthyRate.toFixed(2)),
    };
  }
}
