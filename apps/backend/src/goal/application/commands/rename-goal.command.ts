export class RenameGoalCommand {
  constructor(
    public readonly goalId: string,
    public readonly title: string,
  ) {}
}
