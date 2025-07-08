import { AdminUser } from "@app/common";
import { Injectable as InjectableAuth, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AdminUsersService } from "src/admin-users/admin-users.service";

@InjectableAuth()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<AdminUser, "password"> | null> {
    const user = await this.adminUsersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: AdminUser) {
    const payload = { username: user.email, sub: user.id };
    this.logger.log(`Admin kullanıcısı için JWT oluşturuluyor: ${user.email}`);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
