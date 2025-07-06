import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TenantConnectionManager } from "@app/common/database/tenant-connection.manager";
import { BatchUpdateRespondersCommand } from "../impl/batch-update-responders.command";
import { Logger } from "@nestjs/common";
import { Responder, ResponderStatus } from "@app/common";

@CommandHandler(BatchUpdateRespondersCommand)
export class BatchUpdateRespondersHandler
  implements ICommandHandler<BatchUpdateRespondersCommand>
{
  private readonly logger = new Logger(BatchUpdateRespondersHandler.name);

  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(command: BatchUpdateRespondersCommand): Promise<void> {
    const { tenantId, updates } = command;

    if (!updates || updates.length === 0) {
      return;
    }

    try {
      const connection = await this.tenantManager.getConnection(tenantId);
      const responderRepo = connection.getRepository(Responder);

      await responderRepo.save(
        updates.map((update) => ({
          id: update.id,
          lastSeen: new Date(update.lastSeen),
          status: ResponderStatus.HEALTHY,
        })),
        { chunk: 100 },
      );

      this.logger.log(
        `${updates.length} responder successfully updated for tenant ${tenantId}.`,
      );
    } catch (error) {
      this.logger.error(`Batch update failed for tenant ${tenantId}.`, error);
      throw error;
    }
  }
}
