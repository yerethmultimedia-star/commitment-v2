import { computeHabitStreak } from '../engine/compute-habit-streak.js';
import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';
import { HabitRecurrenceDescriptor } from '../engine/habit-recurrence-descriptor.type.js';

const anchor = new Date(2026, 0, 1);
const daily: HabitRecurrenceDescriptor = { type: HabitRecurrenceType.Daily, daysOfWeek: [], dayOfMonth: null, month: null };

describe('computeHabitStreak', () => {
  it('starts a streak of 1 on the first-ever completion', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 0,
      missedGraceUsed: false,
      lastCompletedDate: null,
      occurredOn: '2026-01-05',
      completed: true,
    });
    expect(result).toEqual({ streak: 1, graceUsed: false, lastCompletedDate: '2026-01-05' });
  });

  it('is idempotent when completing the same occurrence twice', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 3,
      missedGraceUsed: false,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-05',
      completed: true,
    });
    expect(result).toEqual({ streak: 3, graceUsed: false, lastCompletedDate: '2026-01-05' });
  });

  it('increments the streak on a consecutive completion with no gap', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 3,
      missedGraceUsed: false,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-06',
      completed: true,
    });
    expect(result).toEqual({ streak: 4, graceUsed: false, lastCompletedDate: '2026-01-06' });
  });

  it('tolerates a single missed occurrence via grace, preserving and incrementing the streak', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 3,
      missedGraceUsed: false,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-07', // 01-06 was skipped
      completed: true,
    });
    expect(result).toEqual({ streak: 4, graceUsed: true, lastCompletedDate: '2026-01-07' });
  });

  it('resets the streak on two missed occurrences', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 3,
      missedGraceUsed: false,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-08', // 01-06 and 01-07 both skipped
      completed: true,
    });
    expect(result).toEqual({ streak: 1, graceUsed: false, lastCompletedDate: '2026-01-08' });
  });

  it('resets the streak on a miss when grace was already used', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 5,
      missedGraceUsed: true,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-07', // one occurrence (01-06) skipped, but grace is already spent
      completed: true,
    });
    expect(result).toEqual({ streak: 1, graceUsed: false, lastCompletedDate: '2026-01-07' });
  });

  it('a first missed occurrence (not completed) consumes grace but leaves the streak untouched', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 3,
      missedGraceUsed: false,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-06',
      completed: false,
    });
    expect(result).toEqual({ streak: 3, graceUsed: true, lastCompletedDate: '2026-01-05' });
  });

  it('a second consecutive missed occurrence resets the streak to 0', () => {
    const result = computeHabitStreak({
      recurrence: daily,
      anchorDate: anchor,
      previousStreak: 3,
      missedGraceUsed: true,
      lastCompletedDate: '2026-01-05',
      occurredOn: '2026-01-07',
      completed: false,
    });
    expect(result).toEqual({ streak: 0, graceUsed: false, lastCompletedDate: '2026-01-05' });
  });
});
