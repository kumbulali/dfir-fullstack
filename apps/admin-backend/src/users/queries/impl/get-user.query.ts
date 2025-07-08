export class GetUserQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: number,
  ) {}
}
