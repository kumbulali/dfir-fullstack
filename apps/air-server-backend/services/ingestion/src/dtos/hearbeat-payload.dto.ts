import { IsIP, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class HeartbeatPayloadDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsNumber()
  @IsNotEmpty()
  responderId: number;

  @IsString()
  @IsNotEmpty()
  os: string;

  @IsIP()
  @IsNotEmpty()
  ip: string;
}
