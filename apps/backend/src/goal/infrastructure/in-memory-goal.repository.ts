import { Goal, GoalId } from '@commitment/domain';
import { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import { getLoadedVersion } from '../../infrastructure/versioning/loaded-version';
import { OptimisticConcurrencyError } from '../../infrastructure/errors/optimistic-concurrency.error';

export class InMemoryGoalRepository implements VersionedGoalRepository {
  private readonly store = new Map<string, Goal>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns its version, enforcing optimistic
   * concurrency (AR-028). The repository never computes a new version — it
   * only reads `goal.version` (owned by the Aggregate) and records it.
   */
  public async save(goal: Goal): Promise<number> {
    await Promise.resolve();
    const key = goal.id.value;
    const loadedVersion = getLoadedVersion(goal);
    const storedVersion = this.versions.get(key) ?? 0;

    if (loadedVersion !== storedVersion) {
      throw new OptimisticConcurrencyError(key, loadedVersion, storedVersion);
    }

    this.store.set(key, goal);
    this.versions.set(key, goal.version);
    return goal.version;
  }

  public findById(id: GoalId): Promise<Goal | null> {
    const goal = this.store.get(id.value);
    return Promise.resolve(goal ?? null);
  }
}
