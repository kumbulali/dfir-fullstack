import { Module } from "@nestjs/common";
import { GetDashboardStatsHandler } from "./queries/handlers/get-dashboard-stats.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { DashboardController } from "./dashboard.controller";

export const QueryHandlers = [GetDashboardStatsHandler];
@Module({
  imports: [CqrsModule],
  controllers: [DashboardController],
  providers: [...QueryHandlers],
})
export class DashboardModule {}
