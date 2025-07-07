import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeregisterResponderCommand } from "../impl/deregister-responder.command";
import {
  NotFoundException,
  Logger,
  Inject,
  InternalServerErrorException,
} from "@nestjs/common";
import { MqttClient } from "mqtt";
import { EmqxService } from "../../emqx.service";
import {
  JOB_SERVICE,
  MQTT_CLIENT,
  Responder,
  TenantConnectionManager,
} from "@app/common";
import { firstValueFrom } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";

@CommandHandler(DeregisterResponderCommand)
export class DeregisterResponderHandler
  implements ICommandHandler<DeregisterResponderCommand>
{
  private readonly logger = new Logger(DeregisterResponderHandler.name);

  constructor(
    private readonly tenantManager: TenantConnectionManager,
    private readonly emqxService: EmqxService,
    @Inject(MQTT_CLIENT) private readonly mqttClient: MqttClient,
    @Inject(JOB_SERVICE) private readonly jobServiceClient: ClientProxy,
  ) {}

  async execute(
    command: DeregisterResponderCommand,
  ): Promise<{ message: string }> {
    const { tenantId, responderId } = command;

    const connection = await this.tenantManager.getConnection(tenantId);
    const responderRepository = connection.getRepository(Responder);

    const responder = await responderRepository.findOneBy({ id: responderId });
    if (!responder) {
      throw new NotFoundException(
        `Responder with ID ${responderId} not found.`,
      );
    }

    const deregisterTopic = `command/request/${tenantId}/${responder.id}`;
    const payload = { command: "deregister" };
    this.mqttClient.publish(deregisterTopic, JSON.stringify(payload));
    this.logger.log(
      `Deregister komutu, ${responder.id} kullanıcısına gönderildi.`,
    );

    try {
      await this.emqxService.deprovisionUser(responder.token);
    } catch (error) {
      this.logger.error(
        `EMQX kullanıcısı ${responder.id} silinirken hata oluştu. Veritabanı işlemi iptal edildi.`,
        error.stack,
      );

      throw new InternalServerErrorException(
        "Failed to deprovision responder from MQTT broker.",
      );
    }

    // First delete all jobs of the responder.
    await firstValueFrom(
      this.jobServiceClient.send("delete_responder_jobs", {
        responderId,
        tenantId,
      }),
    );
    const deleteResult = await responderRepository.delete({ id: responderId });
    if (deleteResult.affected === 0) {
      throw new InternalServerErrorException(
        `Responder with ID ${responderId} could not be deleted.`,
      );
    }

    this.logger.log(
      `Responder ${responderId} (username: ${responder.token}) sistemden başarıyla kaldırıldı.`,
    );

    return {
      message: `Responder with ID ${responderId} has been successfully deregistered.`,
    };
  }
}
