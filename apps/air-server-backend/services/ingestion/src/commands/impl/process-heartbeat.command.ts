import { HeartbeatPayloadDto } from "../../dtos/hearbeat-payload.dto";

export class ProcessHeartbeatCommand {
  constructor(public readonly payload: HeartbeatPayloadDto) {}
}
