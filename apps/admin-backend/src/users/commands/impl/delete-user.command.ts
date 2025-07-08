export class DeleteUserCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: number,
  ) {}
}
