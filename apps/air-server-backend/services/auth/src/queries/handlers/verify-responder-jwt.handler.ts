import { QueryHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { TenantConnectionManager } from "@app/common/database/tenant-connection.manager";
import { VerifyResponderJwtQuery } from "../impl/verify-responder-jwt.query";
import { Responder, ResponderJwtPayload } from "@app/common";

@QueryHandler(VerifyResponderJwtQuery)
export class VerifyResponderJwtQueryHandler
  implements ICommandHandler<VerifyResponderJwtQuery>
{
  constructor(
    private readonly tenantManager: TenantConnectionManager,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: VerifyResponderJwtQuery): Promise<ResponderJwtPayload> {
    const { tenantId, jwt } = query;

    try {
      const payload: ResponderJwtPayload = this.jwtService.verify(jwt);

      if (payload.tenantId !== tenantId) {
        throw new UnauthorizedException("Tenant ID mismatch.");
      }

      const connection = await this.tenantManager.getConnection(tenantId);
      const responderRepo = connection.getRepository(Responder);
      const responder = await responderRepo.findOneBy({
        id: payload.responderId,
        token: payload.responderToken,
      });

      if (!responder) {
        throw new UnauthorizedException(
          "Responder not found or token is invalid.",
        );
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException(error.message || "Invalid token.");
    }
  }
}
