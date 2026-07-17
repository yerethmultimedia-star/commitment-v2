import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';
import { tasksApi } from '../api/tasks.api';
import { TaskPriority } from '../models/task.model';

export function useTasks() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.tasks.list({ identityId }),
    queryFn: ({ signal }) => tasksApi.list(identityId!, signal).then(result => result.data),
    enabled: Boolean(identityId),
  });
}

export function useDashboardQuery() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.tasks.dashboard(identityId ?? 'anonymous'),
    queryFn: ({ signal }) => tasksApi.dashboard(identityId!, signal),
    enabled: Boolean(identityId),
  });
}

export function useTaskActions() {
  const client = useQueryClient();
  const invalidate = () => Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    client.invalidateQueries({ queryKey: queryKeys.commitments.all }),
  ]);
  return {
    complete: useMutation({ mutationFn: tasksApi.complete, onSuccess: invalidate }),
    archive: useMutation({ mutationFn: tasksApi.archive, onSuccess: invalidate }),
    duplicate: useMutation({ mutationFn: tasksApi.duplicate, onSuccess: invalidate }),
    changePriority: useMutation({
      mutationFn: ({ id, priority }: { id: string; priority: TaskPriority }) =>
        tasksApi.changePriority(id, priority),
      onSuccess: invalidate,
    }),
    edit: useMutation({
      mutationFn: ({ id, title, description }: { id: string; title: string; description?: string }) =>
        tasksApi.edit(id, { title, description }),
      onSuccess: invalidate,
    }),
    relinkGoal: useMutation({
      mutationFn: ({ id, goalId }: { id: string; goalId: string | null }) =>
        tasksApi.relinkGoal(id, goalId),
      onSuccess: invalidate,
    }),
    relinkCommitment: useMutation({
      mutationFn: ({ id, commitmentId }: { id: string; commitmentId: string | null }) =>
        tasksApi.relinkCommitment(id, commitmentId),
      onSuccess: invalidate,
    }),
  };
}
