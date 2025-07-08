import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminUserSeederService } from "./admin-user.seeder";

@Module({
  imports: [ConfigModule],
  providers: [AdminUserSeederService],
})
export class SeederModule {}
