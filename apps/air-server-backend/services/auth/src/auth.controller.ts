import { Controller, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { VerifyJwtQuery } from "./queries/impl/verify-jwt.query";
import { QueryBus } from "@nestjs/cqrs";
import { VerifyResponderJwtQuery } from "./queries/impl/verify-responder-jwt.query";
import { Responder } from "@app/common";

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

  @MessagePattern("verify_responder_jwt")
  async verifyResponderJwt(@Payload() data: { jwt: string; tenantId: string }) {
    return this.queryBus.execute(
      new VerifyResponderJwtQuery(data.tenantId, data.jwt),
    );
  }

  @MessagePattern("generate_responder_jwt")
  async generateResponderJwt(
    @Payload() data: { responder: Responder; tenantId: string },
  ) {
    return this.authService.loginResponder(data.responder, data.tenantId);
  }
}
