import { describeHabitRecurrence } from '../engine/describe-habit-recurrence.js';
import { HabitRecurrenceType } from '../value-objects/habit-recurrence.js';

describe('describeHabitRecurrence', () => {
  it('classifies Daily', () => {
    expect(describeHabitRecurrence({ type: HabitRecurrenceType.Daily, daysOfWeek: [], dayOfMonth: null, month: null }))
      .toEqual({ kind: 'daily', daysOfWeek: [], dayOfMonth: null, month: null });
  });

  it('classifies Workdays', () => {
    expect(describeHabitRecurrence({ type: HabitRecurrenceType.Workdays, daysOfWeek: [], dayOfMonth: null, month: null }))
      .toEqual({ kind: 'workdays', daysOfWeek: [], dayOfMonth: null, month: null });
  });

  it('classifies Weekly and passes through daysOfWeek', () => {
    expect(describeHabitRecurrence({ type: HabitRecurrenceType.Weekly, daysOfWeek: [1, 3, 5], dayOfMonth: null, month: null }))
      .toEqual({ kind: 'weekly', daysOfWeek: [1, 3, 5], dayOfMonth: null, month: null });
  });

  it('classifies Biweekly and passes through daysOfWeek', () => {
    expect(describeHabitRecurrence({ type: HabitRecurrenceType.Biweekly, daysOfWeek: [1], dayOfMonth: null, month: null }))
      .toEqual({ kind: 'biweekly', daysOfWeek: [1], dayOfMonth: null, month: null });
  });

  it('classifies Monthly and passes through dayOfMonth', () => {
    expect(describeHabitRecurrence({ type: HabitRecurrenceType.Monthly, daysOfWeek: [], dayOfMonth: 15, month: null }))
      .toEqual({ kind: 'monthly', daysOfWeek: [], dayOfMonth: 15, month: null });
  });

  it('classifies Yearly and passes through month + dayOfMonth', () => {
    expect(describeHabitRecurrence({ type: HabitRecurrenceType.Yearly, daysOfWeek: [], dayOfMonth: 25, month: 11 }))
      .toEqual({ kind: 'yearly', daysOfWeek: [], dayOfMonth: 25, month: 11 });
  });
});
