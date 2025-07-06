import { Controller, Post, Body, Headers, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AssignJobCommand } from "./commands/impl/assign-job.command";
import { JwtAuthGuard } from "@app/common";
import { AssignJobDto } from "./dtos/assign-job.dto";

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
}
