import { Controller, Post, UseGuards, Request, Get } from "@nestjs/common";
import { AuthGuard as NestAuthGuard } from "@nestjs/passport";
import { AuthService as AppAuthService } from "./auth.service";
import { AdminJwtGuard } from "src/guards/admin-jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AppAuthService) {}

  @UseGuards(NestAuthGuard("local"))
  @Post("login")
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AdminJwtGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
