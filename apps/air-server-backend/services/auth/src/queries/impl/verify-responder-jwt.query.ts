export class VerifyResponderJwtQuery {
  constructor(
    public readonly tenantId: string,
    public readonly jwt: string,
  ) {}
}
