export class LinkHabitToGoalCommand {
  constructor(
    public readonly goalId: string,
    public readonly habitId: string,
  ) {}
}
