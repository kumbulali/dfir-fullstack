export class DeregisterResponderCommand {
  constructor(
    public readonly tenantId: string,
    public readonly responderId: number,
  ) {}
}
