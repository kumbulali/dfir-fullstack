import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Param,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AssignJobCommand } from "./commands/impl/assign-job.command";
import { JwtAuthGuard, ResponderJwtGuard } from "@app/common";
import { AssignJobDto } from "./dtos/assign-job.dto";
import { SubmitJobResultDto } from "./dtos/submit-job-result.dto";
import { SubmitJobResultCommand } from "./commands/impl/submit-job-result.command";

@Controller("jobs")
export class JobServiceController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async assignJob(
    @Headers("x-tenant-id") tenantId: string,
    @Body() assignJobDto: AssignJobDto,
  ) {
    return await this.commandBus.execute(
      new AssignJobCommand(tenantId, assignJobDto),
    );
  }

  @UseGuards(ResponderJwtGuard)
  @Post(":jobId/result")
  async submitResult(
    @Headers("x-tenant-id") tenantId: string,
    @Param("jobId") jobId: number,
    @Body() submitResultDto: SubmitJobResultDto,
  ) {
    return this.commandBus.execute(
      new SubmitJobResultCommand(tenantId, jobId, submitResultDto.result),
    );
  }
}
