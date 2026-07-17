import { Goal, GoalId } from '@commitment/domain';
import { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';

export class InMemoryGoalRepository implements VersionedGoalRepository {
  private readonly store = new Map<string, Goal>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns the new version.
   * Version increments only when there are uncommitted events (Rule #87).
   */
  public save(goal: Goal): Promise<number> {
    const key = goal.id.value;
    const hasNewEvents = goal.getUncommittedEvents().length > 0;
    const current = this.versions.get(key) ?? 0;
    const next = hasNewEvents
      ? current + goal.getUncommittedEvents().length
      : current;
    this.store.set(key, goal);
    this.versions.set(key, next);
    return Promise.resolve(next);
  }

  public findById(id: GoalId): Promise<Goal | null> {
    const goal = this.store.get(id.value);
    return Promise.resolve(goal ?? null);
  }
}
