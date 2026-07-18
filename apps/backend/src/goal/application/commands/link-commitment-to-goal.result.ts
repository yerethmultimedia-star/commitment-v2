export class LinkCommitmentToGoalResult {
  constructor(
    public readonly goalId: string,
    public readonly commitmentIds: readonly string[],
    public readonly version: number,
  ) {}
}
