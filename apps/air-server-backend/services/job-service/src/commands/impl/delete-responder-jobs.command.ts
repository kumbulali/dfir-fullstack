export class DeleteResponderJobsCommand {
  constructor(
    public readonly tenantId: string,
    public readonly responderId: number,
  ) {}
}
