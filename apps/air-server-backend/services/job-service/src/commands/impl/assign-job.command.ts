import { AssignJobDto } from "../../dtos/assign-job.dto";

export class AssignJobCommand {
  constructor(
    public readonly tenantId: string,
    public readonly assignJobDto: AssignJobDto,
  ) {}
}
