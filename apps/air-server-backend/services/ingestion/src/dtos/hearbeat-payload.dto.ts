import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class HeartbeatPayloadDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsNumber()
  @IsNotEmpty()
  responderId: number;

  @IsNumber()
  @IsNotEmpty()
  timestamp: number;
}
