export class LinkHabitToGoalResult {
  constructor(
    public readonly goalId: string,
    public readonly habitIds: readonly string[],
    public readonly version: number,
  ) {}
}
