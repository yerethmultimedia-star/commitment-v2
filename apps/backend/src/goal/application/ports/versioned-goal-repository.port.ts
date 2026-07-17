import { Goal, GoalId } from '@commitment/domain';

/**
 * Application-layer repository port used by all command handlers.
 *
 * save() returns the aggregate's post-save version number so that
 * handlers can include it in the response without querying again.
 * Mirrors VersionedCommitmentRepository (ADR-021 — same pattern, no
 * Event Sourcing, state stays the source of truth).
 */
export interface VersionedGoalRepository {
  save(goal: Goal): Promise<number>;
  findById(id: GoalId): Promise<Goal | null>;
}
