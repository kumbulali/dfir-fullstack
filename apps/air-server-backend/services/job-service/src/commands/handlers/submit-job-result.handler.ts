import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import {
  Job,
  JobStatus,
  STATS_AGGREGATOR_SERVICE,
  TenantConnectionManager,
} from "@app/common";
import { SubmitJobResultCommand } from "../impl/submit-job-result.command";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(SubmitJobResultCommand)
export class SubmitJobResultHandler
  implements ICommandHandler<SubmitJobResultCommand>
{
  private readonly logger = new Logger(SubmitJobResultHandler.name);

  constructor(
    private readonly tenantManager: TenantConnectionManager,
    @Inject(STATS_AGGREGATOR_SERVICE) private readonly statsClient: ClientProxy,
  ) {}

  async execute(command: SubmitJobResultCommand) {
    const { tenantId, jobId, result } = command;

    const connection = await this.tenantManager.getConnection(tenantId);
    const jobRepo = connection.getRepository(Job);

    const updateResult = await jobRepo.update(
      { id: jobId },
      {
        status: JobStatus.COMPLETED,
        resultData: result,
      },
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException(
        `Job with ID ${jobId} not found or could not be updated.`,
      );
    }

    this.statsClient.emit("job.status.changed", {
      fromStatus: "pending",
      toStatus: "completed",
    });

    this.logger.log(`Job ${jobId} for tenant ${tenantId} marked as COMPLETED.`);

    return { message: "Result submitted successfully." };
  }
}
