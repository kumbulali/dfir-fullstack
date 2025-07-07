import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { AxiosRequestConfig } from "axios";

@Injectable()
export class EmqxService {
  private readonly logger = new Logger(EmqxService.name);
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPass: string;
  private apiToken: string | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>("EMQX_API_URL");
    this.apiUser = this.configService.getOrThrow<string>("EMQX_API_USER");
    this.apiPass = this.configService.getOrThrow<string>("EMQX_API_PASSWORD");
  }

  async provisionUser(username: string, password: string): Promise<void> {
    const endpoint = "/authentication/password_based:built_in_database/users";
    const payload = {
      user_id: username,
      password,
      is_superuser: false,
    };
    await this.requestWithAuth("post", endpoint, payload);
    this.logger.log(`Successfully created EMQX user: ${username}`);
  }

  async deprovisionUser(username: string): Promise<void> {
    const endpoint = `/authentication/password_based:built_in_database/users/${username}`;
    await this.requestWithAuth("delete", endpoint);
    this.logger.log(`Successfully deprovisioned EMQX user: ${username}`);
  }

  async provisionAcl(
    tenantId: string,
    username: string,
    responderId: number,
  ): Promise<void> {
    const endpoint = "/authorization/sources/built_in_database/rules/users";
    const payload = [
      {
        username,
        rules: [
          {
            permission: "allow",
            action: "publish",
            topic: `health/${tenantId}/${responderId}`,
          },
          {
            permission: "allow",
            action: "subscribe",
            topic: `command/request/${tenantId}/${responderId}`,
          },
          {
            permission: "allow",
            action: "publish",
            topic: `command/response/${tenantId}/${responderId}`,
          },
          {
            permission: "deny",
            action: "all",
            topic: `#`,
          },
        ],
      },
    ];
    await this.requestWithAuth("post", endpoint, payload);
    this.logger.log(`Successfully created ACL rule for user: ${username}`);
  }

  async deprovisionAcl(username: string): Promise<void> {
    const endpoint = `/authorization/sources/built_in_database/rules/users/${username}`;
    await this.requestWithAuth("delete", endpoint);
    this.logger.log(`Successfully deprovisioned EMQX user: ${username}`);
  }

  private async login(): Promise<void> {
    this.logger.log(
      "EMQX API token is invalid or expired. Attempting to log in...",
    );
    const response = await firstValueFrom(
      this.httpService.post(`${this.apiUrl}/login`, {
        username: this.apiUser,
        password: this.apiPass,
      }),
    );
    this.apiToken = response.data.token;
    this.logger.log("Successfully obtained new EMQX API token.");
  }

  private async requestWithAuth(
    method: "post" | "get" | "put" | "delete",
    endpoint: string,
    data?,
  ): Promise<unknown> {
    if (!this.apiToken) {
      await this.login();
    }

    try {
      return await this.makeRequest(method, endpoint, data);
    } catch (error) {
      if (error.response?.status === 401) {
        this.logger.debug(
          "EMQX API request failed with 401. Retrying with a new token...",
        );
        await this.login();
        return await this.makeRequest(method, endpoint, data);
      }
      throw error;
    }
  }

  private async makeRequest(
    method: "post" | "get" | "put" | "delete",
    endpoint: string,
    data?,
  ): Promise<unknown> {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    };
    const url = `${this.apiUrl}${endpoint}`;
    if (method === "delete") {
      return await firstValueFrom(this.httpService.delete(url, config));
    }
    return await firstValueFrom(this.httpService[method](url, data, config));
  }
}
