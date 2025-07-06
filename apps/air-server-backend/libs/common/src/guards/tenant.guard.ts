import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const tenantId = request.headers["x-tenant-id"];

    if (!tenantId) {
      throw new UnauthorizedException("x-tenant-id header is required.");
    }

    return true;
  }
}
