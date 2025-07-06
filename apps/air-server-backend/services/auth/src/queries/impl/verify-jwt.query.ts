export class VerifyJwtQuery {
  constructor(
    public readonly jwt: string,
    public readonly tenantId: string,
  ) {}
}
