export class LinkCommitmentToGoalCommand {
  constructor(
    public readonly goalId: string,
    public readonly commitmentId: string,
  ) {}
}
