import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { TenantConnectionManager } from "@app/common/database/tenant-connection.manager";
import { LoginUserQuery } from "../impl/login-user.query";
import { User } from "@app/common";
import * as bcrypt from "bcrypt";

@QueryHandler(LoginUserQuery)
export class LoginUserQueryHandler implements IQueryHandler<LoginUserQuery> {
  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(query: LoginUserQuery): Promise<Omit<User, "password">> {
    const { tenantId, email, password } = query;

    const connection = await this.tenantManager.getConnection(tenantId);
    const userRepository = connection.getRepository(User);

    const user = await userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException("User with this email not found.");
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return result;
  }
}
