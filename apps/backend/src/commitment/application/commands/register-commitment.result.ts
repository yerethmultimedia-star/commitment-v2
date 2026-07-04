export class RegisterCommitmentResult {
  constructor(
    public readonly commitmentId: string,
    public readonly version: number,
  ) {}
}
