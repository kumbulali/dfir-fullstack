import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { RegisterResponderCommand } from "../impl/register-responder.command";
import {
  Inject,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import {
  AUTH_SERVICE,
  EnrollmentToken,
  Responder,
  TenantConnectionManager,
} from "@app/common";
import { EmqxService } from "../../emqx.service";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@CommandHandler(RegisterResponderCommand)
export class RegisterResponderHandler
  implements ICommandHandler<RegisterResponderCommand>
{
  private readonly logger = new Logger(RegisterResponderHandler.name);

  constructor(
    private readonly tenantManager: TenantConnectionManager,
    private readonly emqxService: EmqxService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  async execute(command: RegisterResponderCommand) {
    const { tenantId, registerDto, ipAddress } = command;
    const { enrollmentToken, operatingSystem } = registerDto;

    const connection = await this.tenantManager.getConnection(tenantId);
    const enrollmentTokenRepo = connection.getRepository(EnrollmentToken);

    const tokenRecord = await enrollmentTokenRepo.findOneBy({
      token: enrollmentToken,
    });

    if (
      !tokenRecord ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException("Invalid or expired enrollment token.");
    }

    const responderRepository = connection.getRepository(Responder);
    const password = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `resp_${crypto.randomBytes(12).toString("hex")}`;

    const savedResponder = await responderRepository.save(
      responderRepository.create({
        token: username,
        password: hashedPassword,
        operatingSystem: operatingSystem,
        ipAddress: ipAddress,
        lastSeen: new Date(),
      }),
    );

    const { accessToken, jti } = await firstValueFrom(
      this.authClient.send("generate_responder_jwt", {
        responder: savedResponder,
        tenantId,
      }),
    );

    await responderRepository.update(
      { id: savedResponder.id },
      { activeJti: jti },
    );

    try {
      await this.emqxService.provisionUser(username, password);
      await this.emqxService.provisionAcl(
        tenantId,
        username,
        savedResponder.id,
      );

      tokenRecord.usedAt = new Date();
      await enrollmentTokenRepo.save(tokenRecord);
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
      id: savedResponder.id,
      username: username,
      password: password,
      accessToken,
    };
  }
}
