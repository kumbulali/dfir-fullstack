import { Module, Global, DynamicModule, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { Redis } from "ioredis";
import { TenantConnectionManager } from "./tenant-connection.manager";
import { REDIS_CLIENT, TENANT_CONNECTION } from "../constants";

@Global()
@Module({})
export class TenancyModule {
  static register(): DynamicModule {
    const tenantConnectionFactory = {
      provide: TENANT_CONNECTION,
      scope: Scope.REQUEST,
      inject: [REQUEST, TenantConnectionManager],
      useFactory: async (request: any, manager: TenantConnectionManager) => {
        let tenantId: string | undefined;

        if (request.headers) {
          tenantId = request.headers["x-tenant-id"];
        } else if (request.data?.tenantId) {
          tenantId = request.data.tenantId;
        } else if (request.tenantId) {
          tenantId = request.tenantId;
        }

        if (!tenantId) {
          console.error(
            "Could not extract tenantId from request context:",
            request,
          );
          throw new Error(
            "Tenant ID could not be extracted from the request context.",
          );
        }

        return manager.getConnection(tenantId);
      },
    };

    const redisProvider = {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        return new Redis({
          host: config.get("REDIS_HOST"),
          port: config.get<number>("REDIS_PORT"),
        });
      },
    };

    return {
      module: TenancyModule,
      providers: [
        TenantConnectionManager,
        tenantConnectionFactory,
        redisProvider,
      ],
      exports: [TenantConnectionManager, TENANT_CONNECTION],
    };
  }
}
