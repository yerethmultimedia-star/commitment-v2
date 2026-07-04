import { Commitment, CommitmentId } from '@commitment/domain';

/**
 * Application-layer repository port used by all command handlers.
 *
 * save() returns the aggregate's post-save version number so that
 * handlers can include it in the response without querying again.
 * This prepares the interface for future Optimistic Concurrency (Rule #87).
 */
export interface VersionedCommitmentRepository {
  save(commitment: Commitment): Promise<number>;
  findById(id: CommitmentId): Promise<Commitment | null>;
}
