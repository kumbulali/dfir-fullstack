export class UpdateStatsCommand {
  constructor(
    public readonly field: string,
    public readonly value: number,
  ) {}
}
