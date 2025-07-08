import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  Inject,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";
import * as crypto from "crypto";
import { CreateTenantCommand } from "../impl/create-tenant.command";
import { ConfigService } from "@nestjs/config";
import {
  EnrollmentToken,
  Job,
  MASTER_DB_CONNECTION,
  Responder,
  Tenant,
  TenantStatus,
  User,
} from "@app/common";

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler
  implements ICommandHandler<CreateTenantCommand>
{
  private readonly logger = new Logger(CreateTenantHandler.name);

  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateTenantCommand): Promise<Tenant> {
    const { tenantId, tenantName } = command.createTenantDto;

    const tenantRepo = this.masterConnection.getRepository(Tenant);
    const existingTenant = await tenantRepo.findOneBy({ id: tenantId });
    if (existingTenant) {
      throw new ConflictException(
        `Tenant with ID '${tenantId}' already exists.`,
      );
    }

    const dbUser = `dfir_user_${tenantId}`;
    const dbPassword = crypto.randomBytes(16).toString("hex");
    const dbName = `dfir_tenant_${tenantId}`;

    const suQueryRunner = this.masterConnection.createQueryRunner();
    await suQueryRunner.connect();

    try {
      this.logger.log(`Tenant ${tenantId} user creating...`);
      await suQueryRunner.query(
        `CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`,
      );
      this.logger.log(`Tenant ${tenantId} db creating...`);
      await suQueryRunner.query(
        `CREATE DATABASE "${dbName}" OWNER "${dbUser}"`,
      );
      this.logger.log(`DB & USER CREATE SUCCESS.`);

      await this.runMigrationsForTenant(dbName, dbUser, dbPassword);

      const savedTenant = await this.saveTenantRecord(
        tenantId,
        tenantName,
        dbName,
        dbUser,
        dbPassword,
      );

      this.logger.log(
        `Tenant ${tenantId} record successfuly saved into master DB.`,
      );
      return savedTenant;
    } catch (error) {
      this.logger.error(
        `Tenant ${tenantId} error, rollback starting...`,
        error.stack,
      );
      await this.cleanupFailedProvision(suQueryRunner, dbName, dbUser);
      throw new InternalServerErrorException("Tenant provisioning failed.");
    } finally {
      await suQueryRunner.release();
    }
  }

  private async runMigrationsForTenant(
    dbName: string,
    dbUser: string,
    dbPassword: string,
  ): Promise<void> {
    let tempDataSource: DataSource | null = null;
    try {
      this.logger.log(
        `Tenant ${dbName} temp connection for table generation with migrations...`,
      );
      tempDataSource = new DataSource({
        type: "postgres",
        host: this.configService.get("POSTGRES_HOST"),
        port: this.configService.get<number>("POSTGRES_PORT"),
        database: dbName,
        username: dbUser,
        password: dbPassword,
        entities: [User, EnrollmentToken, Responder, Job],
        migrations: ["dist/migrations/*.js"],
        migrationsRun: true,
      });
      await tempDataSource.initialize();
      this.logger.log(`Migrations are completed successfuly.`);
    } finally {
      if (tempDataSource?.isInitialized) {
        await tempDataSource.destroy();
      }
    }
  }

  private async saveTenantRecord(
    tenantId: string,
    tenantName: string,
    dbName: string,
    dbUser: string,
    dbPassword: string,
  ): Promise<Tenant> {
    const queryRunner = this.masterConnection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const tenantRepo = queryRunner.manager.getRepository(Tenant);
      const newTenant = tenantRepo.create({
        id: tenantId,
        name: tenantName,
        status: TenantStatus.ACTIVE,
        dbHost: this.configService.get<string>("POSTGRES_HOST"),
        dbName: dbName,
        dbUser: dbUser,
        dbPasswordRef: dbPassword,
      });
      const savedTenant = await tenantRepo.save(newTenant);
      await queryRunner.commitTransaction();
      return savedTenant;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async cleanupFailedProvision(
    queryRunner: QueryRunner,
    dbName: string,
    dbUser: string,
  ): Promise<void> {
    try {
      this.logger.warn(`Rollback process: DB "${dbName}" removing...`);
      await queryRunner.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      this.logger.warn(`Rollback process: User "${dbUser}" removing...`);
      await queryRunner.query(`DROP USER IF EXISTS "${dbUser}"`);
    } catch (cleanupError) {
      this.logger.error(
        `CRITICAL EXCEPTION: Rollback process failed remove db and user manually: DB=${dbName}, User=${dbUser}`,
        cleanupError.stack,
      );
    }
  }
}
