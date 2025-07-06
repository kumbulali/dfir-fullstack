import { Responder, ResponderJwtPayload, User } from "@app/common";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: Omit<User, "password">) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginResponder(responder: Responder, tenantId: string) {
    const jti = uuidv4();
    const payload: ResponderJwtPayload = {
      responderId: responder.id,
      responderToken: responder.token,
      tenantId: tenantId,
      jti: jti,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, jti };
  }
}
