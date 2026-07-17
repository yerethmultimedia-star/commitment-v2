export class RelinkTaskGoalCommand {
  constructor(
    public readonly id: string,
    /** null is a real target state (goal-independent), not "leave unchanged" — always pass explicitly. */
    public readonly goalId: string | null,
  ) {}
}
