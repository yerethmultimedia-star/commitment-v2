import { Injectable } from '@nestjs/common';
import { Habit, HabitId } from '@commitment/domain';
import { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';
import { getLoadedVersion } from '../../infrastructure/versioning/loaded-version';
import { OptimisticConcurrencyError } from '../../infrastructure/errors/optimistic-concurrency.error';

@Injectable()
export class InMemoryHabitRepository implements HabitVersionedRepository {
  private readonly store = new Map<string, Habit>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns its version, enforcing optimistic
   * concurrency (AR-028). The repository never computes a new version — it
   * only reads `habit.version` (owned by the Aggregate) and records it.
   */
  public async save(habit: Habit): Promise<number> {
    await Promise.resolve();
    const key = habit.id.value;
    const loadedVersion = getLoadedVersion(habit);
    const storedVersion = this.versions.get(key) ?? 0;

    if (loadedVersion !== storedVersion) {
      throw new OptimisticConcurrencyError(key, loadedVersion, storedVersion);
    }

    this.store.set(key, habit);
    this.versions.set(key, habit.version);
    return habit.version;
  }

  public findById(id: HabitId): Promise<Habit | null> {
    const habit = this.store.get(id.value);
    return Promise.resolve(habit ?? null);
  }

  public delete(id: HabitId): Promise<void> {
    this.store.delete(id.value);
    this.versions.delete(id.value);
    return Promise.resolve();
  }
}
