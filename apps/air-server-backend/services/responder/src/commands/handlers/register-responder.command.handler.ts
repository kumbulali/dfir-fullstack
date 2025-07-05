import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { TenantConnectionManager } from "@app/common/database/tenant-connection.manager";
import { RegisterResponderCommand } from "../impl/register-responder.command";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { EmqxService } from "../../emqx.service";
import { Responder, ResponderStatus } from "@app/common";
// EmqxApiService import edildi
// import { EmqxApiService } from '@app/common/emqx/emqx-api.service';

@CommandHandler(RegisterResponderCommand)
export class RegisterResponderHandler
  implements ICommandHandler<RegisterResponderCommand>
{
  private readonly logger = new Logger(RegisterResponderHandler.name);

  constructor(
    private readonly tenantManager: TenantConnectionManager,
    private readonly emqxApiService: EmqxService, // HttpService yerine EmqxApiService enjekte edildi
  ) {}

  async execute(command: RegisterResponderCommand) {
    const { tenantId, registerDto, ipAddress } = command;

    const connection = await this.tenantManager.getConnection(tenantId);
    const responderRepository = connection.getRepository(Responder);

    const password = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `resp_${crypto.randomBytes(12).toString("hex")}`;

    const savedResponder = await responderRepository.save(
      responderRepository.create({
        token: username,
        password: hashedPassword,
        operatingSystem: registerDto.operatingSystem,
        ipAddress: ipAddress,
        lastSeen: new Date(),
        status: ResponderStatus.HEALTHY,
      }),
    );

    try {
      await this.emqxApiService.provisionUser(username, password);
      await this.emqxApiService.provisionAcl(tenantId, username);
    } catch (error) {
      this.logger.error(
        `Failed to provision EMQX user for ${username}. Rolling back database insert.`,
        error.stack,
      );
      await responderRepository.delete({ id: savedResponder.id });
      throw new InternalServerErrorException(
        "Failed to provision responder in MQTT broker.",
      );
    }

    return {
      message: "Responder registered and provisioned successfully.",
      username: username,
      password: password,
    };
  }
}
