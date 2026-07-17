export class CompleteGoalResult {
  constructor(
    public readonly goalId: string,
    public readonly state: string,
    public readonly version: number,
  ) {}
}
