import { IsString, IsNotEmpty, Matches } from "class-validator";
export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_]+$/, {
    message:
      "Tenant ID can only contain lowercase letters, numbers, and underscores.",
  })
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  tenantName: string;
}
