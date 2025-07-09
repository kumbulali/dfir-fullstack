import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteTenantCommand } from "../impl/delete-tenant.command";
import {
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { MASTER_DB_CONNECTION, Tenant } from "@app/common";

@CommandHandler(DeleteTenantCommand)
export class DeleteTenantHandler
  implements ICommandHandler<DeleteTenantCommand>
{
  private readonly logger = new Logger(DeleteTenantHandler.name);

  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
  ) {}

  async execute(command: DeleteTenantCommand): Promise<void> {
    const { tenantId } = command;
    const tenantRepo = this.masterConnection.getRepository(Tenant);
    const tenant = await tenantRepo.findOneBy({ id: tenantId });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found.`);
    }

    const { dbName, dbUser } = tenant;
    const suQueryRunner = this.masterConnection.createQueryRunner();
    await suQueryRunner.connect();
    try {
      this.logger.log(`Dropping database '${dbName}'...`);
      await suQueryRunner.query(
        `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`,
      );
      this.logger.log(`Dropping user '${dbUser}'...`);
      await suQueryRunner.query(`DROP USER IF EXISTS "${dbUser}"`);
    } catch (error) {
      this.logger.error(
        `Failed to drop database/user for tenant '${tenantId}'. Aborting deletion.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Failed to clean up tenant database and user.",
      );
    } finally {
      await suQueryRunner.release();
    }

    try {
      const deleteResult = await tenantRepo.delete({ id: tenantId });
      if (deleteResult.affected === 0) {
        throw new NotFoundException(
          `Tenant with ID '${tenantId}' was not found in master DB for deletion.`,
        );
      }
      this.logger.log(
        `Tenant record for '${tenantId}' deleted successfully from master DB.`,
      );
    } catch (error) {
      this.logger.error(
        `CRITICAL: Database/user for tenant '${tenantId}' were deleted, but failed to delete the record from master DB. Manual intervention required.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Database cleaned up, but failed to delete tenant record.",
      );
    }
  }
}
