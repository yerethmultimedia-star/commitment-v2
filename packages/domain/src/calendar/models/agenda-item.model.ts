export type AgendaItemType = 'task' | 'commitment' | 'habit' | 'reminder';

/**
 * A single scheduled thing on a given day, normalized from whichever
 * domain it came from (Task due date, Commitment target date, a Habit's
 * scheduled day, or — once modeled — a reminder). Calendar renders a flat
 * list of these; it never talks to Task/Commitment/Habit sources directly.
 */
export interface AgendaItem {
  readonly id: string;
  readonly type: AgendaItemType;
  readonly title: string;
  /** ISO time (HH:mm) when known; all-day items omit it. */
  readonly time?: string;
  /** Known duration in minutes (e.g. a Task's estimatedMinutes); omitted when unknown. */
  readonly durationMinutes?: number;
  readonly completed: boolean;
  /** Id of the Task/Commitment/Habit this item was derived from. */
  readonly sourceId: string;
}

export interface DayAgenda {
  /** ISO date (YYYY-MM-DD) this agenda is for. */
  readonly date: string;
  readonly items: readonly AgendaItem[];
}
