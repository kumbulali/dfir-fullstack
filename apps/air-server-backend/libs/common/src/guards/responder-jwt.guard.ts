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
export class ResponderJwtGuard implements CanActivate {
  private readonly logger = new Logger(ResponderJwtGuard.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const jwt = request.headers?.authorization?.split(" ")[1];
    const tenantId = request.headers?.["x-tenant-id"];

    if (!jwt || !tenantId) {
      throw new UnauthorizedException(
        "Authorization token and x-tenant-id header are required.",
      );
    }

    try {
      const userPayload = await firstValueFrom(
        this.authClient
          .send("verify_responder_jwt", { jwt, tenantId })
          .pipe(timeout(5000)),
      );

      request.user = userPayload;

      return true;
    } catch (error) {
      this.logger.error("Responder JWT validation failed:", error);
      throw new UnauthorizedException(error.message || "Invalid token");
    }
  }

  private getRequest(context: ExecutionContext): any {
    if (context.getType() === "http") {
      return context.switchToHttp().getRequest();
    }
    throw new UnauthorizedException(
      "Unsupported execution context for ResponderJwtGuard",
    );
  }
}
