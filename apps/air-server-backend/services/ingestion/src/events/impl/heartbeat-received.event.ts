import { HeartbeatPayloadDto } from "../../dtos/hearbeat-payload.dto";

export class HeartbeatReceivedEvent {
  constructor(public readonly payload: HeartbeatPayloadDto) {}
}
