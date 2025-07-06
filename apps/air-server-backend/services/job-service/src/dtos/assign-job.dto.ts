import { IsString, IsNotEmpty, IsArray, IsNumber } from "class-validator";

export class AssignJobDto {
  @IsNumber()
  @IsNotEmpty()
  responderId: number;

  @IsString()
  @IsNotEmpty()
  command: "add" | "subtract";

  @IsArray()
  args: unknown[];
}
