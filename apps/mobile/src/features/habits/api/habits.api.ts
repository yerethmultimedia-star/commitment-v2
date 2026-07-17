import { apiClient } from '@/core/api/api-client';
import { isDemoModeActive } from '@/core/demo/demo-mode.store';
import { demoHabitsRepository, CreateHabitPayload, EditHabitPayload } from '@/core/demo/demo-habits.repository';
import { HabitSummary, HabitRecurrenceType } from '@commitment/domain';

export interface CreateHabitApiPayload extends CreateHabitPayload {
  id: string;
  identityId: string;
}

// The backend's HabitView read-model is a flat DTO (matches Task's own
// TaskView convention); mobile's HabitSummary nests recurrence fields under
// `recurrence` so every screen (demo or real) reads one consistent shape.
// This is the one place that translates between them.
interface HabitViewDto {
  id: string;
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
}

function mapHabitView(view: HabitViewDto): HabitSummary {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: view.id,
    title: view.title,
    recurrence: {
      type: view.recurrenceType as HabitRecurrenceType,
      daysOfWeek: view.daysOfWeek,
      dayOfMonth: view.dayOfMonth,
      month: view.month,
    },
    reminderHour: view.reminderHour,
    reminderMinute: view.reminderMinute,
    recurrenceAnchorDate: view.recurrenceAnchorDate,
    currentStreakDays: view.currentStreakDays,
    completedToday: view.lastCompletedDate === today,
    lastCompletedDate: view.lastCompletedDate,
    enabled: view.state === 'Active',
    postponedUntil: view.postponedUntil ?? undefined,
    goalId: view.goalId ?? undefined,
  };
}

// Demo Mode is a data-source switch checked here, at the API boundary — the
// one place allowed to know it exists. Hooks and components call the same
// habitsApi.* methods either way and never branch on demo mode themselves.
export const habitsApi = {
  list: async (identityId?: string) => {
    if (isDemoModeActive()) return demoHabitsRepository.list();
    return apiClient.get('habits', { searchParams: identityId ? { identityId } : {} }).json<{ data: HabitViewDto[] }>()
      .then((res) => ({ items: res.data.map(mapHabitView), total: res.data.length }));
  },

  getById: async (id: string) => {
    if (isDemoModeActive()) return demoHabitsRepository.getById(id);
    return apiClient.get(`habits/${id}`).json<HabitViewDto>().then(mapHabitView);
  },

  create: async (payload: CreateHabitApiPayload | CreateHabitPayload): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) return demoHabitsRepository.create(payload);
    return apiClient.post('habits', { json: payload }).json<{ id: string }>().then((res) => ({ habitId: res.id }));
  },

  edit: async (id: string, payload: EditHabitPayload): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.edit(id, payload);
      return { habitId: id };
    }
    await apiClient.patch(`habits/${id}`, { json: payload });
    return { habitId: id };
  },

  complete: async (id: string): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.complete(id);
      return { habitId: id };
    }
    await apiClient.post(`habits/${id}/complete`, { json: {} });
    return { habitId: id };
  },

  uncomplete: async (id: string): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.uncomplete(id);
      return { habitId: id };
    }
    await apiClient.post(`habits/${id}/uncomplete`, { json: {} });
    return { habitId: id };
  },

  postpone: async (id: string, minutes: number): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.postpone(id, minutes);
      return { habitId: id };
    }
    await apiClient.post(`habits/${id}/postpone`, { json: { minutes } });
    return { habitId: id };
  },

  setEnabled: async (id: string, enabled: boolean): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.setEnabled(id, enabled);
      return { habitId: id };
    }
    await apiClient.patch(`habits/${id}/${enabled ? 'enable' : 'disable'}`, { json: {} });
    return { habitId: id };
  },

  archive: async (id: string): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.archive(id);
      return { habitId: id };
    }
    await apiClient.delete(`habits/${id}`);
    return { habitId: id };
  },

  /** goalId: null removes the link (goal-independent) — a real target state, not "leave unchanged". */
  relinkGoal: async (id: string, goalId: string | null): Promise<{ habitId: string }> => {
    if (isDemoModeActive()) {
      await demoHabitsRepository.relinkGoal(id, goalId);
      return { habitId: id };
    }
    await apiClient.patch(`habits/${id}/goal`, { json: { goalId } });
    return { habitId: id };
  },
};
