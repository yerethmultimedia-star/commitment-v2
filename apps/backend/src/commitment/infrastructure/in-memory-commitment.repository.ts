import { Commitment, CommitmentId } from '@commitment/domain';
import { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';

export class InMemoryCommitmentRepository implements VersionedCommitmentRepository {
  private readonly store = new Map<string, Commitment>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns the new version.
   * Version increments only when there are uncommitted events (Rule #87).
   */
  public save(commitment: Commitment): Promise<number> {
    const key = commitment.id.value;
    const hasNewEvents = commitment.getUncommittedEvents().length > 0;
    const current = this.versions.get(key) ?? 0;
    const next = hasNewEvents
      ? current + commitment.getUncommittedEvents().length
      : current;
    this.store.set(key, commitment);
    this.versions.set(key, next);
    return Promise.resolve(next);
  }

  public findById(id: CommitmentId): Promise<Commitment | null> {
    const commitment = this.store.get(id.value);
    return Promise.resolve(commitment ?? null);
  }
}
