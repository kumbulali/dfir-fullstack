import { TenantStatus } from "@app/common";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
