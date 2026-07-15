export class EditCommitmentCommand {
  constructor(
    public readonly commitmentId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly recurrencePattern?: string,
    public readonly targetDate?: string,
    public readonly priority?: string,
  ) {}
}
