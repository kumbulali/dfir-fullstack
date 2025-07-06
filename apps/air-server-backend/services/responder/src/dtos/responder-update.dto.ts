import { Type } from "class-transformer";
import { IsDate, IsNumber } from "class-validator";

export class ResponderUpdateDto {
  @IsNumber()
  id: number;

  @Type(() => Date)
  @IsDate()
  lastSeen: Date;
}
