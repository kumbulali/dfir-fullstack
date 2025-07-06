import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { VerifyJwtQuery } from "../impl/verify-jwt.query";
import { TenantConnectionManager, User } from "@app/common";

@QueryHandler(VerifyJwtQuery)
export class VerifyJwtQueryHandler implements IQueryHandler<VerifyJwtQuery> {
  constructor(
    private readonly tenantManager: TenantConnectionManager,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: VerifyJwtQuery): Promise<Omit<User, "password">> {
    const { jwt, tenantId } = query;

    try {
      const payload = this.jwtService.verify(jwt);
      const userId = payload.sub;

      const connection = await this.tenantManager.getConnection(tenantId);
      const userRepository = connection.getRepository(User);

      const user = await userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new UnauthorizedException("User not found in this tenant.");
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch {
      throw new UnauthorizedException("Invalid token or user.");
    }
  }
}
