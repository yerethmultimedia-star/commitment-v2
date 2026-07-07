export class CancelCommitmentResult {
  constructor(
    public readonly commitmentId: string,
    public readonly state: string,
    public readonly version: number,
  ) {}
}
