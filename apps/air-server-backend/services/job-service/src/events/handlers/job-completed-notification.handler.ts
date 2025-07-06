import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { JobCompletedNotificationEvent } from "../impl/job-completed-notification.event";
import { Inject, Logger } from "@nestjs/common";
import { MQTT_CLIENT } from "@app/common";
import { MqttClient } from "mqtt/*";

@EventsHandler(JobCompletedNotificationEvent)
export class JobCompletedNotificationHandler
  implements IEventHandler<JobCompletedNotificationEvent>
{
  private readonly logger = new Logger(JobCompletedNotificationHandler.name);

  constructor(@Inject(MQTT_CLIENT) private readonly mqttClient: MqttClient) {}

  async handle(event: JobCompletedNotificationEvent) {
    const { tenantId, jobId, result } = event;
    const notificationTopic = `notification/job_completed/${tenantId}`;
    const payload = { jobId, status: "completed", result };

    this.mqttClient.publish(notificationTopic, JSON.stringify(payload));
    this.logger.log(
      `Published job completion notification for Job ID: ${jobId} to topic: ${notificationTopic}`,
    );
  }
}
