export class UpdateGoalDescriptionResult {
  constructor(
    public readonly goalId: string,
    public readonly description: string | null,
    public readonly version: number,
  ) {}
}
