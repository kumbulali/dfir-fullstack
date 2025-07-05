export interface MqttAclRequest {
  username: string;
  clientid: string;
  topic: string;
  action: "publish" | "subscribe";
}
