import { Commitment, CommitmentId } from '@commitment/domain';

/**
 * Application-layer repository port used by all command handlers.
 *
 * save() returns the aggregate's version number so that handlers can
 * include it in the response without querying again. Enforces optimistic
 * concurrency (AR-028, Rule #87): throws OptimisticConcurrencyError if the
 * aggregate's loaded version no longer matches what's stored.
 */
export interface VersionedCommitmentRepository {
  save(commitment: Commitment): Promise<number>;
  findById(id: CommitmentId): Promise<Commitment | null>;
}
