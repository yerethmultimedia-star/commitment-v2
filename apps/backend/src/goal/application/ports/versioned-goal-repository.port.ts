import { Goal, GoalId } from '@commitment/domain';

/**
 * Application-layer repository port used by all command handlers.
 *
 * save() returns the aggregate's version number so that handlers can
 * include it in the response without querying again. Enforces optimistic
 * concurrency (AR-028, Rule #87): throws OptimisticConcurrencyError if the
 * aggregate's loaded version no longer matches what's stored. Mirrors
 * VersionedCommitmentRepository (ADR-021 — same pattern, no Event Sourcing,
 * state stays the source of truth).
 */
export interface VersionedGoalRepository {
  save(goal: Goal): Promise<number>;
  findById(id: GoalId): Promise<Goal | null>;
}
