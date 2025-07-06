export class BatchUpdateRespondersCommand {
  constructor(
    public readonly tenantId: string,
    public readonly updates: { id: number; lastSeen: Date }[],
  ) {}
}
