import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import {
  Injectable as InjectableLocal,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../auth.service";

@InjectableLocal()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: "email" });
  }

  async validate(email: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    return user;
  }
}
