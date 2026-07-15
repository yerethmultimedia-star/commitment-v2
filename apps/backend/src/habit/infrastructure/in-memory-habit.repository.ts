import { Injectable } from '@nestjs/common';
import { Habit, HabitId } from '@commitment/domain';
import { HabitVersionedRepository } from '../application/ports/habit-versioned-repository.port';

@Injectable()
export class InMemoryHabitRepository implements HabitVersionedRepository {
  private readonly store = new Map<string, Habit>();
  private readonly versions = new Map<string, number>();

  /** Persists the aggregate and returns the new version. Version increments only when there are uncommitted events. */
  public save(habit: Habit): Promise<number> {
    const key = habit.id.value;
    const hasNewEvents = habit.getUncommittedEvents().length > 0;
    const current = this.versions.get(key) ?? 0;
    const next = hasNewEvents
      ? current + habit.getUncommittedEvents().length
      : current;
    this.store.set(key, habit);
    this.versions.set(key, next);
    return Promise.resolve(next);
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
