import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException, Req } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { LoginUserQuery } from "../queries/impl/login-user.query";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly queryBus: QueryBus) {
    super({
      usernameField: "email",
      passReqToCallback: true,
    });
  }

  async validate(
    @Req() req: Request,
    email: string,
    password: string,
  ): Promise<unknown> {
    const tenantId = req.headers["x-tenant-id"] as string;
    if (!tenantId) {
      throw new UnauthorizedException("Tenant ID is required in headers.");
    }

    return await this.queryBus.execute(
      new LoginUserQuery(tenantId, email, password),
    );
  }
}
