import { isHabitDueOn } from '../engine/is-habit-due-on.js';
import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';
import { HabitRecurrenceDescriptor } from '../engine/habit-recurrence-descriptor.type.js';

const anchor = new Date(2026, 0, 5); // Monday 2026-01-05

function recurrence(overrides: Partial<HabitRecurrenceDescriptor>): HabitRecurrenceDescriptor {
  return { type: HabitRecurrenceType.Daily, daysOfWeek: [], dayOfMonth: null, month: null, ...overrides };
}

describe('isHabitDueOn', () => {
  it('Daily is always due, any day', () => {
    expect(isHabitDueOn(recurrence({ type: HabitRecurrenceType.Daily }), new Date(2026, 0, 5), anchor)).toBe(true);
    expect(isHabitDueOn(recurrence({ type: HabitRecurrenceType.Daily }), new Date(2026, 5, 30), anchor)).toBe(true);
  });

  it('Workdays is due Mon-Fri, not Sat/Sun', () => {
    const r = recurrence({ type: HabitRecurrenceType.Workdays });
    expect(isHabitDueOn(r, new Date(2026, 0, 5), anchor)).toBe(true); // Mon
    expect(isHabitDueOn(r, new Date(2026, 0, 9), anchor)).toBe(true); // Fri
    expect(isHabitDueOn(r, new Date(2026, 0, 10), anchor)).toBe(false); // Sat
    expect(isHabitDueOn(r, new Date(2026, 0, 11), anchor)).toBe(false); // Sun
  });

  it('Weekly is due only on the chosen days of week', () => {
    const r = recurrence({ type: HabitRecurrenceType.Weekly, daysOfWeek: [1, 3, 5] });
    expect(isHabitDueOn(r, new Date(2026, 0, 5), anchor)).toBe(true); // Mon
    expect(isHabitDueOn(r, new Date(2026, 0, 6), anchor)).toBe(false); // Tue
    expect(isHabitDueOn(r, new Date(2026, 0, 7), anchor)).toBe(true); // Wed
  });

  it('Biweekly is due on the anchor week and every other week after, not the weeks in between', () => {
    const r = recurrence({ type: HabitRecurrenceType.Biweekly, daysOfWeek: [1] });
    expect(isHabitDueOn(r, new Date(2026, 0, 5), anchor)).toBe(true); // anchor week Monday
    expect(isHabitDueOn(r, new Date(2026, 0, 12), anchor)).toBe(false); // next week Monday — skipped
    expect(isHabitDueOn(r, new Date(2026, 0, 19), anchor)).toBe(true); // two weeks later — due again
  });

  it('Biweekly still requires the day-of-week to match even on a due week', () => {
    const r = recurrence({ type: HabitRecurrenceType.Biweekly, daysOfWeek: [1] });
    expect(isHabitDueOn(r, new Date(2026, 0, 7), anchor)).toBe(false); // Wed of the due week
  });

  it('Monthly fires on the chosen day of month', () => {
    const r = recurrence({ type: HabitRecurrenceType.Monthly, dayOfMonth: 15 });
    expect(isHabitDueOn(r, new Date(2026, 0, 15), anchor)).toBe(true);
    expect(isHabitDueOn(r, new Date(2026, 0, 14), anchor)).toBe(false);
  });

  it('Monthly day 31 clamps to the last day of a short month instead of skipping it', () => {
    const r = recurrence({ type: HabitRecurrenceType.Monthly, dayOfMonth: 31 });
    expect(isHabitDueOn(r, new Date(2026, 1, 28), anchor)).toBe(true); // Feb 2026 has 28 days
    expect(isHabitDueOn(r, new Date(2026, 3, 30), anchor)).toBe(true); // April has 30 days
    expect(isHabitDueOn(r, new Date(2026, 0, 31), anchor)).toBe(true); // January has 31 days — no clamping needed
  });

  it('Yearly fires on the chosen month + day', () => {
    const r = recurrence({ type: HabitRecurrenceType.Yearly, month: 5, dayOfMonth: 10 });
    expect(isHabitDueOn(r, new Date(2026, 5, 10), anchor)).toBe(true);
    expect(isHabitDueOn(r, new Date(2027, 5, 10), anchor)).toBe(true);
    expect(isHabitDueOn(r, new Date(2026, 5, 11), anchor)).toBe(false);
  });

  it('Yearly on Feb 29 clamps to Feb 28 on a non-leap year but fires on Feb 29 on a leap year', () => {
    const r = recurrence({ type: HabitRecurrenceType.Yearly, month: 1, dayOfMonth: 29 });
    expect(isHabitDueOn(r, new Date(2026, 1, 28), anchor)).toBe(true); // 2026 is not a leap year
    expect(isHabitDueOn(r, new Date(2028, 1, 29), anchor)).toBe(true); // 2028 is a leap year
    expect(isHabitDueOn(r, new Date(2028, 1, 28), anchor)).toBe(false); // no clamping needed in a leap year
  });

  it('is never due before the anchor date', () => {
    const r = recurrence({ type: HabitRecurrenceType.Daily });
    expect(isHabitDueOn(r, new Date(2026, 0, 4), anchor)).toBe(false); // the day before anchor
  });
});
