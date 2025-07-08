import { Injectable as InjectableGuard } from "@nestjs/common";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";

@InjectableGuard()
export class AdminJwtGuard extends PassportAuthGuard("jwt") {}
