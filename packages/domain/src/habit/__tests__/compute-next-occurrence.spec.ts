import { computeNextOccurrence } from '../engine/compute-next-occurrence.js';
import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';
import { HabitRecurrenceDescriptor } from '../engine/habit-recurrence-descriptor.type.js';

const anchor = new Date(2026, 0, 5); // Monday 2026-01-05
const reminderTime = { hour: 9, minute: 0 };

function recurrence(overrides: Partial<HabitRecurrenceDescriptor>): HabitRecurrenceDescriptor {
  return { type: HabitRecurrenceType.Daily, daysOfWeek: [], dayOfMonth: null, month: null, ...overrides };
}

describe('computeNextOccurrence', () => {
  it('returns later today when the reminder time has not passed yet', () => {
    const r = recurrence({ type: HabitRecurrenceType.Daily });
    const after = new Date(2026, 0, 5, 8, 0); // Mon 08:00, before the 09:00 reminder
    const next = computeNextOccurrence(r, reminderTime, anchor, after);
    expect(next).toEqual(new Date(2026, 0, 5, 9, 0));
  });

  it('rolls to tomorrow when today\'s reminder time has already passed', () => {
    const r = recurrence({ type: HabitRecurrenceType.Daily });
    const after = new Date(2026, 0, 5, 10, 0); // Mon 10:00, after the 09:00 reminder
    const next = computeNextOccurrence(r, reminderTime, anchor, after);
    expect(next).toEqual(new Date(2026, 0, 6, 9, 0));
  });

  it('skips to the next scheduled weekday for Weekly recurrence', () => {
    const r = recurrence({ type: HabitRecurrenceType.Weekly, daysOfWeek: [1, 3, 5] }); // Mon/Wed/Fri
    const after = new Date(2026, 0, 5, 10, 0); // Mon 10:00, past today's reminder
    const next = computeNextOccurrence(r, reminderTime, anchor, after);
    expect(next).toEqual(new Date(2026, 0, 7, 9, 0)); // Wednesday
  });

  it('lands on the clamped last day of a short month for Monthly day 31', () => {
    const r = recurrence({ type: HabitRecurrenceType.Monthly, dayOfMonth: 31 });
    const after = new Date(2026, 1, 1, 0, 0); // Feb 1
    const next = computeNextOccurrence(r, reminderTime, new Date(2026, 0, 1), after);
    expect(next).toEqual(new Date(2026, 1, 28, 9, 0)); // Feb 2026 has 28 days
  });

  it('rolls to next month when this month\'s day has already passed', () => {
    const r = recurrence({ type: HabitRecurrenceType.Monthly, dayOfMonth: 15 });
    const after = new Date(2026, 0, 20, 0, 0); // Jan 20, past the 15th
    const next = computeNextOccurrence(r, reminderTime, new Date(2026, 0, 1), after);
    expect(next).toEqual(new Date(2026, 1, 15, 9, 0));
  });
});
