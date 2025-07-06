import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TenantConnectionManager } from "@app/common/database/tenant-connection.manager";
import { CreateEnrollmentTokenCommand } from "../impl/create-enrollment-token.command";
import { Logger } from "@nestjs/common";
import { EnrollmentToken } from "@app/common";

@CommandHandler(CreateEnrollmentTokenCommand)
export class CreateEnrollmentTokenHandler
  implements ICommandHandler<CreateEnrollmentTokenCommand>
{
  private readonly logger = new Logger(CreateEnrollmentTokenHandler.name);

  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(command: CreateEnrollmentTokenCommand) {
    const { tenantId } = command;
    const connection = await this.tenantManager.getConnection(tenantId);
    const tokenRepository = connection.getRepository(EnrollmentToken);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let generatedToken = "";
    for (let i = 0; i < 6; i++) {
      generatedToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const enrollmentToken = tokenRepository.create({
      token: generatedToken,
      tenantId,
      expiresAt,
    });
    await tokenRepository.save(enrollmentToken);

    return { enrollmentToken: generatedToken };
  }
}
