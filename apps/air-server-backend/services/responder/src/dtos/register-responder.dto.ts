import {
  IsString,
  IsNotEmpty,
  IsAlphanumeric,
  IsUppercase,
  Length,
} from "class-validator";

export class RegisterResponderDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @IsUppercase()
  @Length(6, 6)
  enrollmentToken: string;

  @IsString()
  @IsNotEmpty()
  operatingSystem: string;
}
