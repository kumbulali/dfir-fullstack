import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, DataSourceOptions } from "typeorm";
import { Redis } from "ioredis";
import { MASTER_DB_CONNECTION, REDIS_CLIENT } from "../constants";
import { Tenant, User } from "../entities";
import { TenantStatus } from "../enums";

@Injectable()
export class TenantConnectionManager {
  private readonly localConnectionCache = new Map<string, DataSource>();

  constructor(
    @Inject(MASTER_DB_CONNECTION) private readonly masterConnection: DataSource,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  public async getConnection(tenantId: string): Promise<DataSource> {
    if (this.localConnectionCache.has(tenantId)) {
      const dataSource = this.localConnectionCache.get(tenantId)!;
      return dataSource.isInitialized ? dataSource : dataSource.initialize();
    }

    const tenantData = await this.getTenantData(tenantId);

    // TODO: AWS KMS OR VAULT
    const password = tenantData.dbPasswordRef;

    const config: DataSourceOptions = {
      type: "postgres",
      host: tenantData.dbHost,
      port: 5432,
      database: tenantData.dbName,
      username: tenantData.dbUser,
      password: password,
      entities: [User],
      synchronize: true, // DEV
    };

    const newDataSource = new DataSource(config);
    await newDataSource.initialize();

    this.localConnectionCache.set(tenantId, newDataSource);
    return newDataSource;
  }

  private async getTenantData(tenantId: string): Promise<Tenant> {
    const cacheKey = `tenant:${tenantId}:data`;
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Tenant data for ${tenantId} found in Redis cache.`);
      return JSON.parse(cachedData) as Tenant;
    }

    console.log(
      `Tenant data for ${tenantId} not in cache. Fetching from master DB.`,
    );
    const tenantRepo = this.masterConnection.getRepository(Tenant);
    const tenant = await tenantRepo.findOneBy({
      id: tenantId,
      status: TenantStatus.ACTIVE,
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID '${tenantId}' not found or is not active.`,
      );
    }

    await this.redisClient.set(cacheKey, JSON.stringify(tenant), "EX", 3600);

    return tenant;
  }
}
