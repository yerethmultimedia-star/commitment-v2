import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';
import { habitsApi } from '../api/habits.api';
import { CreateHabitApiPayload } from '../api/habits.api';
import { EditHabitPayload } from '@/core/demo/demo-habits.repository';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useHabits() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.habits.list,
    queryFn: () => habitsApi.list(identityId ?? undefined).then((result) => result.items),
    enabled: Boolean(identityId),
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: queryKeys.habits.detail(id),
    queryFn: () => habitsApi.getById(id),
    enabled: Boolean(id),
  });
}

/** Toggles today's completion — pass the habit's CURRENT completedToday so the real backend (which has separate complete/uncomplete endpoints, unlike demo mode's single toggle) calls the right one. */
export function useToggleHabit() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completedToday }: { id: string; completedToday: boolean }) =>
      completedToday ? habitsApi.uncomplete(id) : habitsApi.complete(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}

export function useSetHabitEnabled() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => habitsApi.setEnabled(id, enabled),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}

export function useCreateHabit() {
  const client = useQueryClient();
  const { identityId } = useSession();
  return useMutation({
    mutationFn: (payload: Omit<CreateHabitApiPayload, 'id' | 'identityId'>) =>
      habitsApi.create({
        ...payload,
        id: generateId(),
        identityId: identityId ?? '',
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}

export function useEditHabit() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditHabitPayload }) => habitsApi.edit(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}

export function usePostponeHabit() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => habitsApi.postpone(id, minutes),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}

export function useArchiveHabit() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.archive(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}

export function useRelinkHabitGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, goalId }: { id: string; goalId: string | null }) => habitsApi.relinkGoal(id, goalId),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });
}
