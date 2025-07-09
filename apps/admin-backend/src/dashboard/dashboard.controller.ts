import { Controller, Get, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetDashboardStatsQuery } from "./queries/impl/get-dashboard-stats.query";
import { AdminJwtGuard } from "src/guards/admin-jwt.guard";

@UseGuards(AdminJwtGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("stats")
  async getStats() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.queryBus.execute(new GetDashboardStatsQuery());
  }
}
