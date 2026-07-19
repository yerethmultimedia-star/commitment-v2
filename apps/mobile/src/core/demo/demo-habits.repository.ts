import { HabitSummary, HabitRecurrenceType, computeHabitStreak } from '@commitment/domain';

export interface CreateHabitPayload {
  id?: string;
  title: string;
  recurrenceType?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  month?: number;
  reminderHour?: number;
  reminderMinute?: number;
  goalId?: string;
}

export interface EditHabitPayload {
  title?: string;
  recurrenceType?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  month?: number;
  reminderHour?: number;
  reminderMinute?: number;
}

const ANCHOR = '2026-01-01T00:00:00.000Z';

function weekly(daysOfWeek: number[]) {
  return { type: HabitRecurrenceType.Weekly, daysOfWeek, dayOfMonth: null, month: null };
}
function daily() {
  return { type: HabitRecurrenceType.Daily, daysOfWeek: [], dayOfMonth: null, month: null };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * In-memory Habit store. Backed by the real `Habit` aggregate/backend
 * module now (see apps/backend/src/habit) — this demo repository mirrors
 * the same read-model shape (HabitSummary) and API surface so screens
 * behave identically in demo and real mode. Seeded with realistic habits
 * tied to the existing demo goals, same consistent-not-random spirit as
 * COMMITMENT_SEEDS in demo-data.ts.
 */
let demoHabitDTOs: HabitSummary[] = [
  { id: 'h-01', title: 'Morning stretch', recurrence: daily(), reminderHour: 7, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 12, completedToday: true, lastCompletedDate: todayStr(), enabled: true, goalId: 'g-01' },
  { id: 'h-02', title: 'Meditate 10 minutes', recurrence: daily(), reminderHour: 8, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 5, completedToday: false, lastCompletedDate: daysAgoStr(1), enabled: true, goalId: 'g-02' },
  { id: 'h-03', title: 'Portuguese flashcards', recurrence: weekly([1, 3, 5]), reminderHour: 19, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 3, completedToday: true, lastCompletedDate: todayStr(), enabled: true, goalId: 'g-05' },
  { id: 'h-04', title: 'Weekly sprint planning', recurrence: weekly([1]), reminderHour: 9, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 4, completedToday: true, lastCompletedDate: todayStr(), enabled: true, goalId: 'g-04' },
  { id: 'h-05', title: 'Drink 2L of water', recurrence: daily(), reminderHour: 10, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 21, completedToday: false, lastCompletedDate: daysAgoStr(1), enabled: true, goalId: 'g-01' },
  { id: 'h-06', title: 'Read before bed', recurrence: daily(), reminderHour: 21, reminderMinute: 30, recurrenceAnchorDate: ANCHOR, currentStreakDays: 0, completedToday: false, lastCompletedDate: null, enabled: false, goalId: 'g-06' },
  { id: 'h-07', title: 'Weekly meal prep', recurrence: weekly([0]), reminderHour: 11, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 6, completedToday: false, lastCompletedDate: daysAgoStr(7), enabled: true, goalId: 'g-01' },
  { id: 'h-08', title: 'Practice Duolingo', recurrence: daily(), reminderHour: 20, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 8, completedToday: false, lastCompletedDate: daysAgoStr(1), enabled: true, goalId: 'g-05' },
  { id: 'h-09', title: 'Send a check-in message', recurrence: weekly([3]), reminderHour: 18, reminderMinute: 0, recurrenceAnchorDate: ANCHOR, currentStreakDays: 2, completedToday: false, lastCompletedDate: daysAgoStr(7), enabled: true, goalId: 'g-07' },
  // Goal-independent (2026-07-15 product decision: Goal linkage is opt-in for Habits, not assumed)
  // — a real, deliberate state, not "orphaned". Kept separate from the 9-habit/7-goal table's
  // accounting in DEMO_DATASET.md rather than stripping goalId from an existing seed, so every
  // other doc/screenshot referencing h-01..h-09's existing links stays accurate.
  { id: 'h-10', title: 'Take vitamins', recurrence: daily(), reminderHour: 8, reminderMinute: 30, recurrenceAnchorDate: ANCHOR, currentStreakDays: 9, completedToday: false, lastCompletedDate: daysAgoStr(1), enabled: true, goalId: undefined },
];

function findOrThrow(id: string): HabitSummary {
  const habit = demoHabitDTOs.find((h) => h.id === id);
  if (!habit) throw new Error(`Demo habit not found: ${id}`);
  return habit;
}

function replace(updated: HabitSummary): HabitSummary {
  demoHabitDTOs = demoHabitDTOs.map((h) => (h.id === updated.id ? updated : h));
  return updated;
}

export const demoHabitsRepository = {
  list: async () => ({ items: demoHabitDTOs, total: demoHabitDTOs.length }),

  getById: async (id: string): Promise<HabitSummary> => findOrThrow(id),

  create: async (payload: CreateHabitPayload): Promise<{ habitId: string }> => {
    // Quick Capture generates its own id client-side and navigates to it
    // right after create() resolves (Product Decision "Capture vs
    // Authoring") — must be respected, not overwritten, or HabitDetailScreen
    // looks up an id that was never stored.
    const id = payload.id ?? `h-demo-${Date.now()}`;
    const recurrenceType = (payload.recurrenceType as HabitRecurrenceType) ?? HabitRecurrenceType.Daily;
    // Reassign to a new array (not .push()) — list() returns demoHabitDTOs by
    // reference, and React Query's refetch-after-invalidate needs a new
    // reference to actually pick up the change. Same bug class as Tasks' RI-2.
    demoHabitDTOs = [
      ...demoHabitDTOs,
      {
        id,
        title: payload.title,
        recurrence: {
          type: recurrenceType,
          daysOfWeek: payload.daysOfWeek ?? [],
          dayOfMonth: payload.dayOfMonth ?? null,
          month: payload.month ?? null,
        },
        reminderHour: payload.reminderHour ?? 9,
        reminderMinute: payload.reminderMinute ?? 0,
        recurrenceAnchorDate: new Date().toISOString(),
        currentStreakDays: 0,
        completedToday: false,
        lastCompletedDate: null,
        enabled: true,
        goalId: payload.goalId,
      },
    ];
    return { habitId: id };
  },

  edit: async (id: string, payload: EditHabitPayload): Promise<HabitSummary> => {
    const habit = findOrThrow(id);
    const recurrence = payload.recurrenceType
      ? {
          type: payload.recurrenceType as HabitRecurrenceType,
          daysOfWeek: payload.daysOfWeek ?? [],
          dayOfMonth: payload.dayOfMonth ?? null,
          month: payload.month ?? null,
        }
      : habit.recurrence;
    return replace({
      ...habit,
      title: payload.title ?? habit.title,
      recurrence,
      reminderHour: payload.reminderHour ?? habit.reminderHour,
      reminderMinute: payload.reminderMinute ?? habit.reminderMinute,
    });
  },

  complete: async (id: string): Promise<HabitSummary> => {
    const habit = findOrThrow(id);
    const today = todayStr();
    if (habit.completedToday) {
      // Toggle back off — same "tap to undo a mis-tap" affordance the UI already relies on.
      return replace({
        ...habit,
        completedToday: false,
        lastCompletedDate: null,
        currentStreakDays: Math.max(0, habit.currentStreakDays - 1),
      });
    }
    const result = computeHabitStreak({
      recurrence: habit.recurrence,
      anchorDate: new Date(habit.recurrenceAnchorDate),
      previousStreak: habit.currentStreakDays,
      missedGraceUsed: false,
      lastCompletedDate: habit.lastCompletedDate,
      occurredOn: today,
      completed: true,
    });
    return replace({
      ...habit,
      completedToday: true,
      currentStreakDays: result.streak,
      lastCompletedDate: result.lastCompletedDate,
      postponedUntil: undefined,
    });
  },

  uncomplete: async (id: string): Promise<HabitSummary> => {
    const habit = findOrThrow(id);
    return replace({
      ...habit,
      completedToday: false,
      lastCompletedDate: null,
      currentStreakDays: Math.max(0, habit.currentStreakDays - 1),
    });
  },

  postpone: async (id: string, minutes: number): Promise<HabitSummary> => {
    const habit = findOrThrow(id);
    const now = new Date();
    const candidate = new Date(now.getTime() + minutes * 60000);
    const crossesMidnight = candidate.getDate() !== now.getDate()
      || candidate.getMonth() !== now.getMonth()
      || candidate.getFullYear() !== now.getFullYear();
    if (crossesMidnight) {
      const result = computeHabitStreak({
        recurrence: habit.recurrence,
        anchorDate: new Date(habit.recurrenceAnchorDate),
        previousStreak: habit.currentStreakDays,
        missedGraceUsed: false,
        lastCompletedDate: habit.lastCompletedDate,
        occurredOn: todayStr(),
        completed: false,
      });
      return replace({ ...habit, postponedUntil: undefined, currentStreakDays: result.streak });
    }
    return replace({ ...habit, postponedUntil: candidate.toISOString() });
  },

  setEnabled: async (id: string, enabled: boolean): Promise<HabitSummary> => {
    const habit = findOrThrow(id);
    return replace({ ...habit, enabled });
  },

  /** Changes or removes (goalId: null) the habit's linked Goal — mirrors the backend's dedicated `PATCH /habits/:id/goal`, not folded into `edit()`. */
  relinkGoal: async (id: string, goalId: string | null): Promise<HabitSummary> => {
    const habit = findOrThrow(id);
    return replace({ ...habit, goalId: goalId ?? undefined });
  },

  archive: async (id: string): Promise<void> => {
    findOrThrow(id);
    demoHabitDTOs = demoHabitDTOs.filter((h) => h.id !== id);
  },
};
