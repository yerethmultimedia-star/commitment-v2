export interface HabitView {
  id: string;
  identityId: string;
  title: string;
  recurrenceType: string;
  daysOfWeek: number[];
  dayOfMonth: number | null;
  month: number | null;
  reminderHour: number;
  reminderMinute: number;
  recurrenceAnchorDate: string;
  state: string;
  goalId?: string | null;
  lastCompletedDate: string | null;
  currentStreakDays: number;
  postponedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PaginatedHabits {
  data: HabitView[];
  total: number;
  page: number;
  limit: number;
}
