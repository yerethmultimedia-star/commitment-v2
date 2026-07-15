import { AgendaItem, DayAgenda } from '../models/agenda-item.model.js';
import { HabitSummary } from '../../habit/models/habit-summary.model.js';
import { isHabitDueOn } from '../../habit/engine/is-habit-due-on.js';

export interface CalendarTaskInput {
  readonly id: string;
  readonly title: string;
  readonly dueDate?: string;
  readonly completed: boolean;
  readonly estimatedMinutes?: number;
}

export interface CalendarCommitmentInput {
  readonly id: string;
  readonly title: string;
  readonly targetDate?: string;
  readonly completed: boolean;
}

export interface CalendarContext {
  readonly tasks: readonly CalendarTaskInput[];
  readonly commitments: readonly CalendarCommitmentInput[];
  readonly habits: readonly HabitSummary[];
}

const sameDay = (isoDate: string | undefined, date: Date): boolean => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
};

const isoTime = (isoDate: string | undefined): string | undefined => {
  if (!isoDate) return undefined;
  const d = new Date(isoDate);
  if (d.getHours() === 0 && d.getMinutes() === 0) return undefined; // date-only, no real time
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Pure computation: normalizes tasks/commitments/habits for one calendar
 * day into a flat, sorted agenda. No I/O — same constraint as
 * RecommendationEngine's getRecommendations. Reminders aren't populated
 * yet (no reminder domain exists), but the item type is modeled so a
 * future source can slot in without a shape change here.
 */
export function buildDayAgenda(context: CalendarContext, date: Date): DayAgenda {
  const items: AgendaItem[] = [];

  for (const task of context.tasks) {
    if (!sameDay(task.dueDate, date)) continue;
    items.push({
      id: `task-${task.id}`,
      type: 'task',
      title: task.title,
      time: isoTime(task.dueDate),
      durationMinutes: task.estimatedMinutes && task.estimatedMinutes > 0 ? task.estimatedMinutes : undefined,
      completed: task.completed,
      sourceId: task.id,
    });
  }

  for (const commitment of context.commitments) {
    if (!sameDay(commitment.targetDate, date)) continue;
    items.push({
      id: `commitment-${commitment.id}`,
      type: 'commitment',
      title: commitment.title,
      time: isoTime(commitment.targetDate),
      completed: commitment.completed,
      sourceId: commitment.id,
    });
  }

  for (const habit of context.habits) {
    if (!habit.enabled) continue;
    const anchorDate = new Date(habit.recurrenceAnchorDate);
    if (!isHabitDueOn(habit.recurrence, date, anchorDate)) continue;
    items.push({
      id: `habit-${habit.id}`,
      type: 'habit',
      title: habit.title,
      time: `${String(habit.reminderHour).padStart(2, '0')}:${String(habit.reminderMinute).padStart(2, '0')}`,
      completed: habit.completedToday,
      sourceId: habit.id,
    });
  }

  items.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return a.title.localeCompare(b.title);
  });

  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { date: iso, items };
}
