import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout } from "rxjs";
import { AUTH_SERVICE } from "../constants";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const jwt = request.headers.authorization?.split(" ")[1];
    const tenantId = request.headers["x-tenant-id"];

    if (!jwt || !tenantId) {
      throw new UnauthorizedException(
        "Missing authorization token or tenantId in payload.",
      );
    }

    try {
      const user = await firstValueFrom(
        this.authClient
          .send("verify_jwt", { jwt, tenantId })
          .pipe(timeout(5000)),
      );

      request.user = user;

      return true;
    } catch (error) {
      this.logger.error("RPC Auth failed:", error);
      throw new UnauthorizedException(
        "Invalid token or authentication service error.",
      );
    }
  }

  private getRequest(context: ExecutionContext): any {
    const type = context.getType();
    if (type === "http") {
      return context.switchToHttp().getRequest();
    } else if (type === "rpc") {
      return context.switchToRpc().getData();
    }
    throw new UnauthorizedException("Unsupported execution context");
  }
}
