export class ResumeCommitmentResult {
  constructor(
    public readonly commitmentId: string,
    public readonly state: string,
    public readonly version: number,
  ) {}
}
