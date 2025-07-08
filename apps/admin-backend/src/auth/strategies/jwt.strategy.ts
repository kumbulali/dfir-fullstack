import { Injectable as InjectableJwt } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy as PassportJwtStrategy } from "passport-jwt";

@InjectableJwt()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
