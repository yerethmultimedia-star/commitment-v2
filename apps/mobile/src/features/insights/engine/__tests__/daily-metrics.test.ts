/**
 * daily-metrics — pure date/aggregation helpers backing InsightsContext's
 * dailyMetrics/thisWeek/lastWeek/weekActivityFlags fields.
 */

import {
  computeDailyMetrics,
  aggregateWeek,
  computeWeekActivityFlags,
  mondayOf,
  addDays,
} from '../daily-metrics';

// Constructed via the local-time (year, monthIndex, day) form, NOT a UTC ISO
// string — `new Date('2026-07-15T00:00:00.000Z')` parses as UTC midnight,
// which in a negative-offset zone (e.g. America/Costa_Rica, UTC-6) lands on
// the PREVIOUS local calendar day once startOfDay's setHours(0,0,0,0) rounds
// it down further. mondayOf/computeDailyMetrics/etc. all operate in local
// time (matching how the real hook always calls them with `new Date()`), so
// fixtures must be local-time-unambiguous too.
// 2026-07-15 is a Wednesday, so "this week" (partial) and "last week" (full)
// both land comfortably inside the 14-day window, and weekActivityFlags has
// a mix of past, today, and future days to exercise isFuture.
const WEDNESDAY = new Date(2026, 6, 15, 12, 0, 0);

describe('mondayOf', () => {
  it('returns the same date when given a Monday', () => {
    const monday = new Date(2026, 6, 13, 12, 0, 0);
    expect(mondayOf(monday).toISOString().slice(0, 10)).toBe('2026-07-13');
  });

  it('returns the preceding Monday for a mid-week date', () => {
    expect(mondayOf(WEDNESDAY).toISOString().slice(0, 10)).toBe('2026-07-13');
  });

  it('returns the preceding Monday for a Sunday (end of week)', () => {
    const sunday = new Date(2026, 6, 19, 12, 0, 0);
    expect(mondayOf(sunday).toISOString().slice(0, 10)).toBe('2026-07-13');
  });
});

describe('computeDailyMetrics', () => {
  it('produces 14 points, oldest first, ending on today', () => {
    const points = computeDailyMetrics([], [], WEDNESDAY);
    expect(points).toHaveLength(14);
    expect(points[0].date).toBe('2026-07-02');
    expect(points[13].date).toBe('2026-07-15');
  });

  it('counts tasks completed and sums actualMinutes per day', () => {
    const tasks = [
      { status: 'completed', completedAt: '2026-07-15T09:00:00.000Z', actualMinutes: 30 },
      { status: 'completed', completedAt: '2026-07-15T14:00:00.000Z', actualMinutes: 60 },
      { status: 'completed', completedAt: '2026-07-14T09:00:00.000Z', actualMinutes: 15 },
      { status: 'pending', completedAt: null, actualMinutes: 0 },
    ];
    const points = computeDailyMetrics(tasks, [], WEDNESDAY);
    const today = points.find((p) => p.date === '2026-07-15')!;
    const yesterday = points.find((p) => p.date === '2026-07-14')!;
    expect(today.tasksCompleted).toBe(2);
    expect(today.focusMinutes).toBe(90);
    expect(yesterday.tasksCompleted).toBe(1);
    expect(yesterday.focusMinutes).toBe(15);
  });

  it('counts goals completed per day from Goal.completedAt', () => {
    const goals = [
      { completedAt: '2026-07-15T09:00:00.000Z' },
      { completedAt: '2026-07-10T09:00:00.000Z' },
      { completedAt: null },
    ];
    const points = computeDailyMetrics([], goals, WEDNESDAY);
    expect(points.find((p) => p.date === '2026-07-15')!.goalsCompleted).toBe(1);
    expect(points.find((p) => p.date === '2026-07-10')!.goalsCompleted).toBe(1);
    expect(points.find((p) => p.date === '2026-07-13')!.goalsCompleted).toBe(0);
  });

  it('returns all-zero points for an empty dataset — no crash, no fabricated data', () => {
    const points = computeDailyMetrics([], [], WEDNESDAY);
    expect(points.every((p) => p.tasksCompleted === 0 && p.focusMinutes === 0 && p.goalsCompleted === 0)).toBe(true);
  });

  it('scopes plannedMinutes/completedMinutes by dueDate, not completedAt (Story 5)', () => {
    const tasks = [
      // Due today, completed today — counts toward both planned and completed.
      { status: 'completed', dueDate: '2026-07-15T09:00:00.000Z', completedAt: '2026-07-15T09:00:00.000Z', estimatedMinutes: 30, actualMinutes: 25 },
      // Due today, still pending — counts toward planned only.
      { status: 'pending', dueDate: '2026-07-15T09:00:00.000Z', completedAt: null, estimatedMinutes: 20, actualMinutes: 0 },
      // Due yesterday but completed today (late) — must NOT count toward today's planned/completed (dueDate-scoped, not completedAt-scoped, unlike focusMinutes).
      { status: 'completed', dueDate: '2026-07-14T09:00:00.000Z', completedAt: '2026-07-15T09:00:00.000Z', estimatedMinutes: 15, actualMinutes: 15 },
    ];
    const points = computeDailyMetrics(tasks, [], WEDNESDAY);
    const today = points.find((p) => p.date === '2026-07-15')!;

    expect(today.plannedMinutes).toBe(50); // 30 + 20, both due today
    expect(today.completedMinutes).toBe(25); // only the completed one due today
    expect(today.remainingMinutes).toBe(25); // 50 - 25
    expect(today.completionRatio).toBeCloseTo(0.5);
    // focusMinutes (completedAt-scoped) still counts BOTH tasks completed today, including the late one.
    expect(today.focusMinutes).toBe(40); // 25 + 15
  });

  it('returns completionRatio 0 (not NaN) when nothing is due that day', () => {
    const points = computeDailyMetrics([], [], WEDNESDAY);
    const today = points.find((p) => p.date === '2026-07-15')!;
    expect(today.plannedMinutes).toBe(0);
    expect(today.completionRatio).toBe(0);
    expect(Number.isNaN(today.completionRatio)).toBe(false);
  });
});

describe('aggregateWeek', () => {
  const dailyMetrics = computeDailyMetrics(
    [
      { status: 'completed', completedAt: '2026-07-15T09:00:00.000Z', actualMinutes: 30, dueDate: '2026-07-15' }, // this week (Wed)
      { status: 'completed', completedAt: '2026-07-08T09:00:00.000Z', actualMinutes: 60, dueDate: '2026-07-08' }, // last week (Wed)
    ],
    [{ completedAt: '2026-07-15T09:00:00.000Z' }, { completedAt: '2026-07-08T09:00:00.000Z' }],
    WEDNESDAY,
  );

  it('sums tasksCompleted/focusMinutes/goalsCompleted only within the given window', () => {
    const monday = mondayOf(WEDNESDAY);
    const thisWeek = aggregateWeek(dailyMetrics, [], monday, addDays(monday, 7));
    const lastWeek = aggregateWeek(dailyMetrics, [], addDays(monday, -7), monday);

    expect(thisWeek.tasksCompleted).toBe(1);
    expect(thisWeek.totalFocusMinutes).toBe(30);
    expect(thisWeek.goalsCompleted).toBe(1);

    expect(lastWeek.tasksCompleted).toBe(1);
    expect(lastWeek.totalFocusMinutes).toBe(60);
    expect(lastWeek.goalsCompleted).toBe(1);
  });

  it('computes productivity as completed / due-in-window, scoped by dueDate not completedAt', () => {
    const tasks = [
      { status: 'completed', completedAt: '2026-07-15T09:00:00.000Z', actualMinutes: 30, dueDate: '2026-07-15' },
      { status: 'pending', completedAt: null, actualMinutes: 0, dueDate: '2026-07-16' },
      { status: 'pending', completedAt: null, actualMinutes: 0, dueDate: '2026-07-20' }, // outside this week
    ];
    const monday = mondayOf(WEDNESDAY);
    const thisWeek = aggregateWeek(dailyMetrics, tasks, monday, addDays(monday, 7));
    // 2 tasks due this week (07-15, 07-16), 1 completed -> 50%
    expect(thisWeek.productivity).toBe(50);
  });

  it('returns productivity 0 (not NaN) when no tasks are due in the window', () => {
    const monday = mondayOf(WEDNESDAY);
    const thisWeek = aggregateWeek([], [], monday, addDays(monday, 7));
    expect(thisWeek.productivity).toBe(0);
    expect(Number.isNaN(thisWeek.productivity)).toBe(false);
  });

  it('computes avgFocusMinutesPerDay over days actually present in dailyMetrics, not a full 7', () => {
    const monday = mondayOf(WEDNESDAY);
    const thisWeek = aggregateWeek(dailyMetrics, [], monday, addDays(monday, 7));
    // dailyMetrics never extends into the future, so "this week" (Wed) only
    // has 3 elapsed days (Mon/Tue/Wed) in the window, not a padded 7 — 30
    // minutes total / 3 elapsed days, not /7 (which would understate the
    // average by counting unelapsed future days as if they were real zeros).
    expect(thisWeek.avgFocusMinutesPerDay).toBe(Math.round(30 / 3));
  });

  it('sums plannedMinutes/completedMinutes across the window and derives remaining/ratio (Story 5)', () => {
    const tasks = [
      { status: 'completed', completedAt: '2026-07-15T09:00:00.000Z', dueDate: '2026-07-15', estimatedMinutes: 30, actualMinutes: 30 },
      { status: 'pending', completedAt: null, dueDate: '2026-07-16', estimatedMinutes: 20, actualMinutes: 0 },
    ];
    const metrics = computeDailyMetrics(tasks, [], WEDNESDAY);
    const monday = mondayOf(WEDNESDAY);
    const thisWeek = aggregateWeek(metrics, tasks, monday, addDays(monday, 7));

    expect(thisWeek.totalPlannedMinutes).toBe(50); // 30 + 20
    expect(thisWeek.totalCompletedMinutes).toBe(30);
    expect(thisWeek.totalRemainingMinutes).toBe(20);
    expect(thisWeek.completionRatio).toBeCloseTo(0.6);
  });

  it('returns completionRatio 0 (not NaN) when nothing is planned in the window', () => {
    const monday = mondayOf(WEDNESDAY);
    const thisWeek = aggregateWeek([], [], monday, addDays(monday, 7));
    expect(thisWeek.totalPlannedMinutes).toBe(0);
    expect(thisWeek.completionRatio).toBe(0);
    expect(Number.isNaN(thisWeek.completionRatio)).toBe(false);
  });
});

describe('computeWeekActivityFlags', () => {
  it('returns 7 flags, Monday first, for the current calendar week', () => {
    const flags = computeWeekActivityFlags([], WEDNESDAY);
    expect(flags).toHaveLength(7);
    expect(flags[0].date).toBe('2026-07-13');
    expect(flags[6].date).toBe('2026-07-19');
  });

  it('marks days after today as isFuture and never completed', () => {
    const flags = computeWeekActivityFlags([], WEDNESDAY);
    const thursday = flags.find((f) => f.date === '2026-07-16')!;
    const sunday = flags.find((f) => f.date === '2026-07-19')!;
    expect(thursday.isFuture).toBe(true);
    expect(thursday.completed).toBe(false);
    expect(sunday.isFuture).toBe(true);
    expect(sunday.completed).toBe(false);
  });

  it('marks today and past days as not future', () => {
    const flags = computeWeekActivityFlags([], WEDNESDAY);
    const today = flags.find((f) => f.date === '2026-07-15')!;
    const monday = flags.find((f) => f.date === '2026-07-13')!;
    expect(today.isFuture).toBe(false);
    expect(monday.isFuture).toBe(false);
  });

  it('marks a past/today day completed only if a task was actually completed that day', () => {
    const tasks = [
      { status: 'completed', completedAt: '2026-07-14T10:00:00.000Z' },
    ];
    const flags = computeWeekActivityFlags(tasks, WEDNESDAY);
    const tuesday = flags.find((f) => f.date === '2026-07-14')!;
    const monday = flags.find((f) => f.date === '2026-07-13')!;
    expect(tuesday.completed).toBe(true);
    expect(monday.completed).toBe(false);
  });
});
