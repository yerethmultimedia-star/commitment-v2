export class RegisterCommitmentCommand {
  constructor(
    public readonly id: string,
    public readonly identityId: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly recurrencePattern?: string,
    public readonly targetDate?: string,
    public readonly seriesId?: string,
    public readonly priority?: string,
  ) {}
}
