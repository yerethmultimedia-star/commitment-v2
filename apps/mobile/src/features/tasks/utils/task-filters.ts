import { TaskModel, TaskPriority } from '../models/task.model';

/**
 * The six quick filters from the Task List UX round. 'cancelled' isn't a
 * visible chip (no "Canceladas" filter in this round's brief) but tasks in
 * that status still need a category so `all` can include them — see
 * categorize() below.
 */
export type QuickFilterId = 'today' | 'upcoming' | 'inbox' | 'overdue' | 'completed' | 'all';
export type TaskCategory = QuickFilterId | 'cancelled';

export const QUICK_FILTERS: QuickFilterId[] = ['today', 'upcoming', 'inbox', 'overdue', 'completed', 'all'];

/**
 * Filter state — deliberately a struct, not a single enum value, even
 * though only `quickFilter` is wired up this round. The user's own
 * follow-up recommendation: don't assume only one filter is ever active.
 * Adding a dimension later (goalId, commitmentId, tags, priority,
 * hasReminder, estimatedMinutes range...) is one new optional field here
 * plus one new `if` in applyTaskListFilters()'s predicate — not a redesign
 * of the chip row, the store, or this pipeline.
 */
export interface TaskListFilters {
  quickFilter: QuickFilterId;
  // Reserved for future extension (Section 6 "Future Ready" / the user's
  // multi-filter recommendation) — intentionally unimplemented:
  // goalId?: string;
  // commitmentId?: string;
  // tags?: string[];
  // priority?: TaskPriority;
  // hasReminder?: boolean;
  // estimatedMinutesMax?: number;
}

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

/** dueDate as a comparable timestamp — tasks without one sort after every dated task in ascending due-date sorts. */
function dueTime(task: TaskModel): number {
  return task.dueDate ? new Date(task.dueDate).getTime() : Infinity;
}
function createdTime(task: TaskModel): number {
  return new Date(task.createdAt).getTime();
}
function completedTime(task: TaskModel): number {
  return task.completedAt ? new Date(task.completedAt).getTime() : createdTime(task);
}

/**
 * One task -> exactly one category, independent of which filter is
 * currently active. Same categorization backs both the chip counts and the
 * actual filtering, so they can never disagree.
 */
export function categorize(task: TaskModel, now: Date = new Date()): TaskCategory {
  if (task.status === 'completed') return 'completed';
  if (task.status === 'cancelled') return 'cancelled';
  if (!task.dueDate) return 'inbox';
  const due = new Date(task.dueDate);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  if (due < todayStart) return 'overdue';
  if (due <= todayEnd) return 'today';
  return 'upcoming';
}

function byPriorityThenDue(a: TaskModel, b: TaskModel): number {
  const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  return p !== 0 ? p : dueTime(a) - dueTime(b);
}

/** Each quick filter owns its own sort — Section 5 of the round's brief. */
function sortForFilter(tasks: TaskModel[], filter: QuickFilterId): TaskModel[] {
  const sorted = [...tasks];
  switch (filter) {
    case 'today':
      // Alta -> Media -> Baja, then nearest due time within each priority.
      return sorted.sort(byPriorityThenDue);
    case 'upcoming':
      // Fecha (soonest first), then priority breaks ties on the same date.
      return sorted.sort((a, b) => dueTime(a) - dueTime(b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case 'overdue':
      // Oldest overdue first (been waiting longest), priority breaks ties.
      return sorted.sort((a, b) => dueTime(a) - dueTime(b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case 'inbox':
      return sorted.sort((a, b) => createdTime(b) - createdTime(a));
    case 'completed':
      return sorted.sort((a, b) => completedTime(b) - completedTime(a));
    case 'all':
    default:
      // Not specified in the brief — most-recent-first, matching Inbox/
      // Completed's own convention, since 'all' is a catch-all rather than
      // a work queue with its own priority order.
      return sorted.sort((a, b) => createdTime(b) - createdTime(a));
  }
}

/** The single entry point TasksScreen calls — filter, then sort, in one pass. */
export function applyTaskListFilters(tasks: TaskModel[], filters: TaskListFilters, now: Date = new Date()): TaskModel[] {
  const matching = tasks.filter((task) => {
    if (filters.quickFilter !== 'all' && categorize(task, now) !== filters.quickFilter) return false;
    // Future dimensions compose here as additional early-returns, e.g.:
    // if (filters.goalId && task.goalId !== filters.goalId) return false;
    return true;
  });
  return sortForFilter(matching, filters.quickFilter);
}

/** Counts per chip, for the badge numbers next to each filter's label. */
export function countsByFilter(tasks: TaskModel[], now: Date = new Date()): Record<QuickFilterId, number> {
  const counts: Record<QuickFilterId, number> = { today: 0, upcoming: 0, inbox: 0, overdue: 0, completed: 0, all: tasks.length };
  for (const task of tasks) {
    const category = categorize(task, now);
    if (category !== 'cancelled') counts[category] += 1;
  }
  return counts;
}
