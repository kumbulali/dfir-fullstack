import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { AdminUser, MASTER_DB_CONNECTION } from "@app/common";

@Injectable()
export class AdminUsersService {
  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async findOneByEmail(email: string): Promise<AdminUser | null> {
    const adminUserRepository = this.masterConnection.getRepository(AdminUser);
    return adminUserRepository.findOneBy({ email });
  }
}
