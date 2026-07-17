export class RelinkTaskCommitmentCommand {
  constructor(
    public readonly id: string,
    /** null is a real target state (commitment-independent), not "leave unchanged" — always pass explicitly. */
    public readonly commitmentId: string | null,
  ) {}
}
