export class RenameGoalResult {
  constructor(
    public readonly goalId: string,
    public readonly title: string,
    public readonly version: number,
  ) {}
}
