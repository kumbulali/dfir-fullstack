import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Param,
  Get,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AssignJobCommand } from "./commands/impl/assign-job.command";
import { JwtAuthGuard, PaginationDto, ResponderJwtGuard } from "@app/common";
import { AssignJobDto } from "./dtos/assign-job.dto";
import { SubmitJobResultDto } from "./dtos/submit-job-result.dto";
import { SubmitJobResultCommand } from "./commands/impl/submit-job-result.command";
import { GetJobsQuery } from "./queries/impl/get-jobs.query";

@Controller("jobs")
export class JobServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getJobs(
    @Headers("x-tenant-id") tenantId: string,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ) {
    return this.queryBus.execute(new GetJobsQuery(tenantId, paginationDto));
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
