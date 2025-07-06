import { IsNotEmpty, IsObject } from "class-validator";

export class SubmitJobResultDto {
  @IsObject()
  @IsNotEmpty()
  result: Record<string, any>;
}
