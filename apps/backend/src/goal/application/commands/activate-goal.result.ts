export class ActivateGoalResult {
  constructor(
    public readonly goalId: string,
    public readonly state: string,
    public readonly version: number,
  ) {}
}
