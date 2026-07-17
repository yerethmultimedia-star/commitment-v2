import { Habit, HabitState } from '../aggregate/habit.js';
import { HabitId } from '../value-objects/habit-id.js';
import { HabitTitle } from '../value-objects/habit-title.js';
import { HabitRecurrence } from '../value-objects/habit-recurrence.js';
import { HabitReminderTime } from '../value-objects/habit-reminder-time.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { HabitAlreadyArchivedError, HabitCannotBeEditedError, InvalidPostponeDurationError } from '../errors/habit-errors.js';

const HABIT_ID = '018f0000-0000-7000-8000-000000000001';
const IDENTITY_ID = '018f0000-0000-7000-8000-000000000002';

function register(now = new Date(2026, 0, 5, 8, 0)) {
  return Habit.register(
    new HabitId(HABIT_ID),
    new IdentityId(IDENTITY_ID),
    new HabitTitle('Drink water'),
    HabitRecurrence.daily(),
    HabitReminderTime.of(9, 0),
    null,
    now
  );
}

describe('Habit', () => {
  it('registers with zero streak and no completion yet', () => {
    const habit = register();
    expect(habit.title.value).toBe('Drink water');
    expect(habit.state).toBe(HabitState.Active);
    expect(habit.currentStreakDays).toBe(0);
    expect(habit.lastCompletedDate).toBeNull();
    expect(habit.getUncommittedEvents()).toHaveLength(1);
    expect(habit.getUncommittedEvents().at(0)?.name).toBe('habit.registered');
  });

  it('edit() is a no-op and records no event when nothing actually changes', () => {
    const habit = register();
    habit.clearUncommittedEvents();
    habit.edit(new Date(2026, 0, 5, 9, 0), new HabitTitle('Drink water'));
    expect(habit.getUncommittedEvents()).toHaveLength(0);
  });

  it('edit() records an event when the title changes', () => {
    const habit = register();
    habit.clearUncommittedEvents();
    habit.edit(new Date(2026, 0, 5, 9, 0), new HabitTitle('Drink more water'));
    expect(habit.title.value).toBe('Drink more water');
    expect(habit.getUncommittedEvents()).toHaveLength(1);
  });

  it('resets the recurrence anchor when recurrence newly becomes Biweekly', () => {
    const habit = register();
    const editTime = new Date(2026, 5, 1, 9, 0);
    habit.edit(editTime, undefined, HabitRecurrence.biweekly([1]));
    expect(habit.recurrenceAnchorDate).toEqual(editTime);
  });

  it('complete() starts a streak of 1 on first completion', () => {
    const habit = register();
    habit.complete(new Date(2026, 0, 5), new Date(2026, 0, 5, 9, 1));
    expect(habit.currentStreakDays).toBe(1);
    expect(habit.lastCompletedDate).toBe('2026-01-05');
  });

  it('complete() is idempotent for the same day', () => {
    const habit = register();
    habit.complete(new Date(2026, 0, 5), new Date(2026, 0, 5, 9, 1));
    habit.clearUncommittedEvents();
    habit.complete(new Date(2026, 0, 5), new Date(2026, 0, 5, 10, 0));
    expect(habit.getUncommittedEvents()).toHaveLength(0);
    expect(habit.currentStreakDays).toBe(1);
  });

  it('uncomplete() undoes today\'s completion', () => {
    const habit = register();
    habit.complete(new Date(2026, 0, 5), new Date(2026, 0, 5, 9, 1));
    habit.uncomplete(new Date(2026, 0, 5), new Date(2026, 0, 5, 9, 2));
    expect(habit.lastCompletedDate).toBeNull();
    expect(habit.currentStreakDays).toBe(0);
  });

  it('postpone() sets postponedUntil when the snooze stays within today', () => {
    const habit = register();
    const now = new Date(2026, 0, 5, 9, 0);
    habit.postpone(30, now);
    expect(habit.postponedUntil).toBe(new Date(2026, 0, 5, 9, 30).toISOString());
  });

  it('postpone() marks the occurrence missed instead of rolling into tomorrow when it would cross midnight', () => {
    const habit = register();
    const now = new Date(2026, 0, 5, 23, 50);
    habit.postpone(30, now); // would land at 00:20 the next day
    expect(habit.postponedUntil).toBeNull();
    expect(habit.currentStreakDays).toBe(0);
    const lastEvent = habit.getUncommittedEvents().at(-1)!;
    expect(lastEvent.name).toBe('habit.occurrence_missed');
  });

  it('postpone() rejects a non-positive duration', () => {
    const habit = register();
    expect(() => habit.postpone(0, new Date())).toThrow(InvalidPostponeDurationError);
    expect(() => habit.postpone(-5, new Date())).toThrow(InvalidPostponeDurationError);
  });

  it('disable() then enable() round-trips state', () => {
    const habit = register();
    habit.disable();
    expect(habit.state).toBe(HabitState.Disabled);
    habit.enable();
    expect(habit.state).toBe(HabitState.Active);
  });

  it('archive() blocks further edits', () => {
    const habit = register();
    habit.archive();
    expect(habit.state).toBe(HabitState.Archived);
    expect(() => habit.edit(new Date(), new HabitTitle('New title'))).toThrow(HabitCannotBeEditedError);
    expect(() => habit.complete(new Date(), new Date())).toThrow(HabitCannotBeEditedError);
  });

  it('archive() twice throws HabitAlreadyArchivedError', () => {
    const habit = register();
    habit.archive();
    expect(() => habit.archive()).toThrow(HabitAlreadyArchivedError);
  });

  it('relinkGoal() links a goal-independent habit to a goal', () => {
    const habit = register();
    expect(habit.goalId).toBeNull();
    habit.relinkGoal('g-01', new Date(2026, 0, 5, 9, 0));
    expect(habit.goalId).toBe('g-01');
    expect(habit.getUncommittedEvents().at(-1)?.name).toBe('habit.relinked_to_goal');
  });

  it('relinkGoal() changes an existing goal link to a different goal', () => {
    const habit = register();
    habit.relinkGoal('g-01', new Date(2026, 0, 5, 9, 0));
    habit.relinkGoal('g-02', new Date(2026, 0, 6, 9, 0));
    expect(habit.goalId).toBe('g-02');
  });

  it('relinkGoal(null) removes an existing goal link — goal-independence is a valid target state', () => {
    const habit = register();
    habit.relinkGoal('g-01', new Date(2026, 0, 5, 9, 0));
    habit.relinkGoal(null, new Date(2026, 0, 6, 9, 0));
    expect(habit.goalId).toBeNull();
  });

  it('relinkGoal() is a no-op and records no event when the goal is unchanged', () => {
    const habit = register();
    habit.relinkGoal('g-01', new Date(2026, 0, 5, 9, 0));
    habit.clearUncommittedEvents();
    habit.relinkGoal('g-01', new Date(2026, 0, 6, 9, 0));
    expect(habit.getUncommittedEvents()).toHaveLength(0);
  });

  it('relinkGoal() blocks on an archived habit', () => {
    const habit = register();
    habit.archive();
    expect(() => habit.relinkGoal('g-01', new Date())).toThrow(HabitCannotBeEditedError);
  });
});
