import { IsString, IsNotEmpty } from "class-validator";

export class RegisterResponderDto {
  @IsString()
  @IsNotEmpty()
  bootstrapToken: string;

  @IsString()
  @IsNotEmpty()
  operatingSystem: string;
}
