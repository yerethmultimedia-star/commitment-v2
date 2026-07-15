import type { Habit } from '@commitment/domain';
import type { HabitId } from '@commitment/domain';

export interface HabitVersionedRepository {
  save(habit: Habit): Promise<number>;
  findById(id: HabitId): Promise<Habit | null>;
  delete(id: HabitId): Promise<void>;
}
