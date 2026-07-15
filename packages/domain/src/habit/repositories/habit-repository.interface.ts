import type { Habit } from '../aggregate/habit.js';
import type { HabitId } from '../value-objects/habit-id.js';

export interface HabitRepository {
  save(habit: Habit): Promise<number>;
  findById(id: HabitId): Promise<Habit | null>;
  delete(id: HabitId): Promise<void>;
}
