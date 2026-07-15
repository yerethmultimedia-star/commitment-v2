import { buildDayAgenda, CalendarContext } from '../engine/build-day-agenda.js';
import { HabitSummary } from '../../habit/models/habit-summary.model.js';
import { HabitRecurrenceType } from '../../habit/value-objects/habit-recurrence.js';

function weeklyHabit(overrides: Partial<HabitSummary> & { id: string; title: string; daysOfWeek: number[] }): HabitSummary {
  const { daysOfWeek, ...rest } = overrides;
  return {
    recurrence: { type: HabitRecurrenceType.Weekly, daysOfWeek, dayOfMonth: null, month: null },
    reminderHour: 9,
    reminderMinute: 0,
    recurrenceAnchorDate: '2026-01-01',
    currentStreakDays: 0,
    completedToday: false,
    lastCompletedDate: null,
    enabled: true,
    ...rest,
  };
}

describe('buildDayAgenda', () => {
  const monday = new Date('2026-07-13T00:00:00'); // a Monday, local time

  it('includes only items scheduled for the given day', () => {
    const context: CalendarContext = {
      tasks: [
        { id: 't1', title: 'Due today', dueDate: '2026-07-13T09:30:00', completed: false },
        { id: 't2', title: 'Due tomorrow', dueDate: '2026-07-14T09:30:00', completed: false },
      ],
      commitments: [
        { id: 'c1', title: 'Target today', targetDate: '2026-07-13T00:00:00', completed: false },
      ],
      habits: [],
    };

    const agenda = buildDayAgenda(context, monday);

    expect(agenda.date).toBe('2026-07-13');
    expect(agenda.items.map((i) => i.sourceId)).toEqual(['t1', 'c1']);
  });

  it('includes habits scheduled for the day of week', () => {
    const context: CalendarContext = {
      tasks: [],
      commitments: [],
      habits: [
        weeklyHabit({ id: 'h1', title: 'Monday habit', daysOfWeek: [1], currentStreakDays: 3 }),
        weeklyHabit({ id: 'h2', title: 'Wednesday habit', daysOfWeek: [3] }),
      ],
    };

    const agenda = buildDayAgenda(context, monday);

    expect(agenda.items.map((i) => i.sourceId)).toEqual(['h1']);
  });

  it('sorts timed items before all-day items, timed items chronologically', () => {
    const context: CalendarContext = {
      tasks: [
        { id: 't-late', title: 'Late', dueDate: '2026-07-13T18:00:00', completed: false },
        { id: 't-early', title: 'Early', dueDate: '2026-07-13T07:00:00', completed: false },
      ],
      commitments: [
        { id: 'c-allday', title: 'All day', targetDate: '2026-07-13T00:00:00', completed: false },
      ],
      habits: [],
    };

    const agenda = buildDayAgenda(context, monday);

    expect(agenda.items.map((i) => i.sourceId)).toEqual(['t-early', 't-late', 'c-allday']);
  });

  it('returns an empty agenda when nothing is scheduled', () => {
    const context: CalendarContext = { tasks: [], commitments: [], habits: [] };
    const agenda = buildDayAgenda(context, monday);
    expect(agenda.items).toEqual([]);
  });
});
