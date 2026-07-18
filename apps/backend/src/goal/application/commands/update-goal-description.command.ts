export class UpdateGoalDescriptionCommand {
  constructor(
    public readonly goalId: string,
    public readonly description: string,
  ) {}
}
