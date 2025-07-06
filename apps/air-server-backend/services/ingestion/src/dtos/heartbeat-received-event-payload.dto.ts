import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { HeartbeatPayloadDto } from "./hearbeat-payload.dto";

export class HeartbeatReceivedEventPayloadDto {
  @IsString()
  @IsNotEmpty()
  pattern: string;

  @ValidateNested()
  @IsNotEmpty()
  data: HeartbeatPayloadDto;
}
