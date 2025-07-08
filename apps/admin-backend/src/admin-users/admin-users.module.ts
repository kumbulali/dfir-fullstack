import { Module } from "@nestjs/common";
import { AdminUsersService } from "./admin-users.service";
import { MasterDatabaseModule } from "@app/common";

@Module({
  imports: [MasterDatabaseModule],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
