import { Controller, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { VerifyJwtQuery } from "./queries/impl/verify-jwt.query";
import { QueryBus } from "@nestjs/cqrs";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @MessagePattern("verify_jwt")
  async verifyJwt(@Payload() data: { jwt: string; tenantId: string }) {
    return this.queryBus.execute(new VerifyJwtQuery(data.jwt, data.tenantId));
  }
}
