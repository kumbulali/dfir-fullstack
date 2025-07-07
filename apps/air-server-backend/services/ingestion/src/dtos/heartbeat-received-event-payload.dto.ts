import { IsDate, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { HeartbeatPayloadDto } from "./hearbeat-payload.dto";
import { Type } from "class-transformer";

export class HeartbeatReceivedEventPayloadDto {
  @ValidateNested()
  @IsNotEmpty()
  data: HeartbeatPayloadDto;

  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}
