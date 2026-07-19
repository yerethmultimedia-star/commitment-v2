/**
 * Pure date/aggregation helpers backing useInsightsContext's dailyMetrics /
 * thisWeek / lastWeek / weekActivityFlags fields. Kept in engine/ (not
 * hooks/) specifically so they're testable without pulling in the React
 * Native hook import chain (useGoals/useHabits/useSession/etc.) — same
 * separation of concerns the rest of this feature already follows.
 */

import { DailyActivityPoint, DailyMetricsPoint, WeekWindowMetrics, WeekActivityFlag } from '@commitment/domain';

export interface TaskLike {
  status: string;
  completedAt?: string | null;
  dueDate?: string | null;
  actualMinutes?: number | null;
  estimatedMinutes?: number | null;
}

export interface GoalLike {
  completedAt?: string | null;
}

export function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function startOfDay(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

/** Monday of the calendar week containing `d` — the codebase's "this week"/"last week" convention is otherwise rolling-7-day; this feature deliberately uses calendar weeks instead (Mon-Sun), to match the streak row's fixed weekday boxes. */
export function mondayOf(d: Date): Date {
  const date = startOfDay(d);
  const dayIndex = (date.getDay() + 6) % 7; // 0 = Monday
  return addDays(date, -dayIndex);
}

/** Last 7 days (oldest first), real counts from Task.completedAt — no fabricated history. */
export function computeDailyActivity(tasks: { status: string; completedAt?: string | null }[], today: Date = new Date()): DailyActivityPoint[] {
  const points: DailyActivityPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toDateOnly(d.toISOString());
    const completedCount = tasks.filter(
      (t) => t.status === 'completed' && t.completedAt && toDateOnly(t.completedAt) === dateStr,
    ).length;
    points.push({ date: dateStr, completedCount });
  }
  return points;
}

/** Last 14 days (oldest first, including today) — enough to cover both the current (partial) calendar week and the full previous calendar week, whichever weekday "today" falls on. */
export function computeDailyMetrics(tasks: TaskLike[], goals: GoalLike[], today: Date = new Date()): DailyMetricsPoint[] {
  const base = startOfDay(today);
  const points: DailyMetricsPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(base, -i);
    const dateStr = toDateOnly(d.toISOString());
    const completedTasksThatDay = tasks.filter(
      (t) => t.status === 'completed' && t.completedAt && toDateOnly(t.completedAt) === dateStr,
    );
    const completedGoalsThatDay = goals.filter((g) => g.completedAt && toDateOnly(g.completedAt) === dateStr);

    // Story 5 — "comprometido vs completado": both scoped by dueDate falling
    // this day (not completedAt, which focusMinutes above uses), matching
    // aggregateWeek's productivity population so the two numbers are
    // directly comparable.
    const tasksDueThatDay = tasks.filter((t) => t.dueDate && toDateOnly(t.dueDate) === dateStr);
    const plannedMinutes = tasksDueThatDay.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
    const completedMinutes = tasksDueThatDay
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0);

    points.push({
      date: dateStr,
      tasksCompleted: completedTasksThatDay.length,
      focusMinutes: completedTasksThatDay.reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0),
      goalsCompleted: completedGoalsThatDay.length,
      plannedMinutes,
      completedMinutes,
      remainingMinutes: Math.max(0, plannedMinutes - completedMinutes),
      completionRatio: plannedMinutes > 0 ? completedMinutes / plannedMinutes : 0,
    });
  }
  return points;
}

/**
 * Pre-aggregates one calendar-week window from the 14-day dailyMetrics series
 * plus the raw task list (needed for "productivity," which is scoped by
 * Task.dueDate — a different population than "tasks completed," which is
 * scoped by Task.completedAt).
 */
export function aggregateWeek(
  dailyMetrics: DailyMetricsPoint[],
  tasks: TaskLike[],
  windowStart: Date,
  windowEnd: Date,
): WeekWindowMetrics {
  const inWindow = dailyMetrics.filter((p) => {
    const d = new Date(`${p.date}T00:00:00`);
    return d >= windowStart && d < windowEnd;
  });
  const tasksCompleted = inWindow.reduce((sum, p) => sum + p.tasksCompleted, 0);
  const totalFocusMinutes = inWindow.reduce((sum, p) => sum + p.focusMinutes, 0);
  const goalsCompleted = inWindow.reduce((sum, p) => sum + p.goalsCompleted, 0);

  // Productivity = completion rate of tasks DUE within this window (a
  // different, dueDate-scoped population from tasksCompleted above, which is
  // completedAt-scoped) — confirmed formula, see plan §4a.
  const tasksDueInWindow = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(`${toDateOnly(t.dueDate)}T00:00:00`);
    return d >= windowStart && d < windowEnd;
  });
  const completedDueInWindow = tasksDueInWindow.filter((t) => t.status === 'completed').length;

  // Story 5 — same tasksDueInWindow population as productivity above, NOT a
  // sum of dailyMetrics' plannedMinutes/completedMinutes: dailyMetrics only
  // covers the trailing 14 days ending today, so "this week" days that
  // haven't happened yet (e.g. Thu-Sun when today is Wed) have no point in
  // that series at all — summing it would silently under-count minutes
  // planned for the rest of the current week.
  const totalPlannedMinutes = tasksDueInWindow.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
  const totalCompletedMinutes = tasksDueInWindow
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0);
  const productivityDenominator = tasksDueInWindow.length;
  const productivity = productivityDenominator > 0
    ? Math.round((completedDueInWindow / productivityDenominator) * 100)
    : 0;

  return {
    goalsCompleted,
    tasksCompleted,
    productivity,
    totalFocusMinutes,
    avgFocusMinutesPerDay: inWindow.length > 0 ? Math.round(totalFocusMinutes / inWindow.length) : 0,
    totalPlannedMinutes,
    totalCompletedMinutes,
    totalRemainingMinutes: Math.max(0, totalPlannedMinutes - totalCompletedMinutes),
    completionRatio: totalPlannedMinutes > 0 ? totalCompletedMinutes / totalPlannedMinutes : 0,
  };
}

/** Mon-Sun flags for the current calendar week — `isFuture` days must not render as "missed" (see WeekActivityRow). */
export function computeWeekActivityFlags(tasks: TaskLike[], today: Date = new Date()): WeekActivityFlag[] {
  const todayStart = startOfDay(today);
  const monday = mondayOf(todayStart);
  const flags: WeekActivityFlag[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const dateStr = toDateOnly(d.toISOString());
    const isFuture = d > todayStart;
    const completed = !isFuture && tasks.some(
      (t) => t.status === 'completed' && t.completedAt && toDateOnly(t.completedAt) === dateStr,
    );
    flags.push({ date: dateStr, completed, isFuture });
  }
  return flags;
}
