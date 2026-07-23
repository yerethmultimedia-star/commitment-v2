import type { Habit } from '@commitment/domain';
import type { HabitId } from '@commitment/domain';

/**
 * save() enforces optimistic concurrency (AR-028, Rule #87): throws
 * OptimisticConcurrencyError if the aggregate's loaded version no longer
 * matches what's stored.
 */
export interface HabitVersionedRepository {
  save(habit: Habit): Promise<number>;
  findById(id: HabitId): Promise<Habit | null>;
  delete(id: HabitId): Promise<void>;
}
