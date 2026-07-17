export type AgendaItemType = 'task' | 'commitment' | 'habit' | 'milestone' | 'reminder';

/**
 * A single scheduled thing on a given day, normalized from whichever
 * domain it came from (Task due date, Commitment target date, a Habit's
 * scheduled day, a Goal Milestone's target date, or — once modeled — a
 * reminder). Calendar renders a flat list of these; it never talks to
 * Task/Commitment/Habit/Goal sources directly.
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
  /**
   * Id of the Task/Commitment/Habit this item was derived from. For a
   * `milestone` item this is the owning Goal's id (a Milestone has no
   * screen of its own — its detail lives on the Goal Workspace), not the
   * Milestone's own id.
   */
  readonly sourceId: string;
}

export interface DayAgenda {
  /** ISO date (YYYY-MM-DD) this agenda is for. */
  readonly date: string;
  readonly items: readonly AgendaItem[];
}
