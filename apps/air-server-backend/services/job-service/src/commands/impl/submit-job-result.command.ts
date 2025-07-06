export class SubmitJobResultCommand {
  constructor(
    public readonly tenantId: string,
    public readonly jobId: number,
    public readonly result: Record<string, any>,
  ) {}
}
