import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AssignJobCommand } from "../impl/assign-job.command";
import { NotFoundException, Logger, Inject } from "@nestjs/common";
import { MqttClient } from "mqtt";
import {
  Job,
  MQTT_CLIENT,
  Responder,
  TenantConnectionManager,
} from "@app/common";

@CommandHandler(AssignJobCommand)
export class AssignJobHandler implements ICommandHandler<AssignJobCommand> {
  private readonly logger = new Logger(AssignJobHandler.name);

  constructor(
    private readonly tenantManager: TenantConnectionManager,
    @Inject(MQTT_CLIENT) private readonly mqttClient: MqttClient,
  ) {}

  async execute(command: AssignJobCommand) {
    const { tenantId, assignJobDto } = command;
    const { responderId, command: task, args } = assignJobDto;

    const connection = await this.tenantManager.getConnection(tenantId);
    const jobRepo = connection.getRepository(Job);
    const responderRepo = connection.getRepository(Responder);

    const responder = await responderRepo.findOneBy({ id: responderId });
    if (!responder) {
      throw new NotFoundException(
        `Responder with ID ${responderId} not found.`,
      );
    }

    const job = jobRepo.create({ command: task, args, responder });
    const savedJob = await jobRepo.save(job);

    const payload = {
      jobId: savedJob.id,
      command: task,
      args,
    };

    const requestTopic = `command/request/${tenantId}/${responder.token}`;
    this.mqttClient.publish(requestTopic, JSON.stringify(payload));

    this.logger.log(
      `Job ${savedJob.id} (${task}) assigned to responder ${responder.token} via EMQX`,
    );
    return { jobId: savedJob.id, message: "Job assigned successfully." };
  }
}
