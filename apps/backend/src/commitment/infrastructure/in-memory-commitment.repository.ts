import { Commitment, CommitmentId } from '@commitment/domain';
import { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import { getLoadedVersion } from '../../infrastructure/versioning/loaded-version';
import { OptimisticConcurrencyError } from '../../infrastructure/errors/optimistic-concurrency.error';

export class InMemoryCommitmentRepository implements VersionedCommitmentRepository {
  private readonly store = new Map<string, Commitment>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns its version, enforcing optimistic
   * concurrency (AR-028). The repository never computes a new version — it
   * only reads `commitment.version` (owned by the Aggregate) and records it.
   */
  public async save(commitment: Commitment): Promise<number> {
    await Promise.resolve();
    const key = commitment.id.value;
    const loadedVersion = getLoadedVersion(commitment);
    const storedVersion = this.versions.get(key) ?? 0;

    if (loadedVersion !== storedVersion) {
      throw new OptimisticConcurrencyError(key, loadedVersion, storedVersion);
    }

    this.store.set(key, commitment);
    this.versions.set(key, commitment.version);
    return commitment.version;
  }

  public findById(id: CommitmentId): Promise<Commitment | null> {
    const commitment = this.store.get(id.value);
    return Promise.resolve(commitment ?? null);
  }
}
