import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { MASTER_DB_CONNECTION } from "../constants";
import { Tenant } from "../entities";

const masterDataSourceProvider = {
  provide: MASTER_DB_CONNECTION,
  useFactory: (dataSource: DataSource) => dataSource,
  inject: [getDataSourceToken(MASTER_DB_CONNECTION)],
};

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: MASTER_DB_CONNECTION,
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.getOrThrow("POSTGRES_HOST"),
        port: configService.getOrThrow("POSTGRES_PORT"),
        database: configService.getOrThrow("POSTGRES_DB"),
        username: configService.getOrThrow("POSTGRES_USERNAME"),
        password: configService.getOrThrow("POSTGRES_PASSWORD"),
        entities: [Tenant],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [masterDataSourceProvider],
  exports: [masterDataSourceProvider],
})
export class MasterDatabaseModule {}
