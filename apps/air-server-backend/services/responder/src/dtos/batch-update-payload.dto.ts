import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ResponderUpdateDto } from "./responder-update.dto";

export class BatchUpdatePayloadDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponderUpdateDto)
  updates: ResponderUpdateDto[];
}
