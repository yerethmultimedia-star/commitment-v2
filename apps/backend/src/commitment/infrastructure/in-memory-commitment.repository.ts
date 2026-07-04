import {
  Commitment,
  CommitmentId,
  CommitmentRepository,
} from '@commitment/domain';

export class InMemoryCommitmentRepository implements CommitmentRepository {
  private readonly store = new Map<string, Commitment>();

  public save(commitment: Commitment): Promise<void> {
    this.store.set(commitment.id.value, commitment);
    return Promise.resolve();
  }

  public findById(id: CommitmentId): Promise<Commitment | null> {
    const commitment = this.store.get(id.value);
    return Promise.resolve(commitment || null);
  }
}
