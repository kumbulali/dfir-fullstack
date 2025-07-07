import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { Job, TenantConnectionManager } from "@app/common";
import { DeleteResponderJobsCommand } from "../impl/delete-responder-jobs.command";

@CommandHandler(DeleteResponderJobsCommand)
export class DeleteResponderJobsCommandHandler
  implements ICommandHandler<DeleteResponderJobsCommand>
{
  private readonly logger = new Logger(DeleteResponderJobsCommandHandler.name);

  constructor(private readonly tenantManager: TenantConnectionManager) {}

  async execute(command: DeleteResponderJobsCommand) {
    const { tenantId, responderId } = command;

    const connection = await this.tenantManager.getConnection(tenantId);
    const jobRepo = connection.getRepository(Job);

    const deleteResult = await jobRepo.delete({
      responder: { id: responderId },
    });

    this.logger.log(
      `Responder ${responderId}'s ${deleteResult.affected} job(s) deleted.`,
    );

    return { message: "Jobs deleted successfully." };
  }
}
