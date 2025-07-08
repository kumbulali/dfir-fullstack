import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { AdminUser, MASTER_DB_CONNECTION } from "@app/common";

@Injectable()
export class AdminUserSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminUserSeederService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const initialAdminEmail =
      this.configService.get<string>("INITIAL_ADMIN_EMAIL") || "admin@test.com";
    const initialAdminPassword =
      this.configService.get<string>("INITIAL_ADMIN_PASSWORD") || "test123";

    const adminUserRepository = this.masterConnection.getRepository(AdminUser);
    const existingAdmin = await adminUserRepository.findOneBy({});
    if (existingAdmin) {
      this.logger.log("Admin user already exists");
      return;
    }

    this.logger.log("Admin user creating...");

    const hashedPassword = await bcrypt.hash(initialAdminPassword, 10);

    const newAdmin = adminUserRepository.create({
      email: initialAdminEmail,
      password: hashedPassword,
    });

    await adminUserRepository.save(newAdmin);
    this.logger.log(`Admin user created: ${initialAdminEmail}`);
  }
}
