export class CompleteCommitmentResult {
  constructor(
    public readonly commitmentId: string,
    public readonly state: string,
    public readonly version: number,
  ) {}
}
