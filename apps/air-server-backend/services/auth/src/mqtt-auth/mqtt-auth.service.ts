import { Injectable } from "@nestjs/common";

@Injectable()
export class MqttAuthService {
  async validateResponder(
    username: string,
    password?: string,
  ): Promise<boolean> {
    // TODO: Responder validation
    return true;
  }

  checkPermissions(
    username: string,
    topic: string,
    action: "publish" | "subscribe",
  ): boolean {
    const expectedTopicPattern = `health/.+/${username}`;
    const topicRegex = new RegExp(`^${expectedTopicPattern}$`);

    if (action === "publish" && topicRegex.test(topic)) {
      return true;
    }

    return false;
  }
}
