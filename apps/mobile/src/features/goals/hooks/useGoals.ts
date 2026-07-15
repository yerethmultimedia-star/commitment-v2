import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';
import { goalsApi } from '../api/goals.api';

export function useGoals() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.goals.list,
    queryFn: () => goalsApi.list().then((result) => result.items),
    enabled: Boolean(identityId),
  });
}

export function useGoal(id: string | undefined) {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.goals.detail(id ?? ''),
    queryFn: () => goalsApi.getById(id!),
    enabled: Boolean(identityId) && Boolean(id),
  });
}

export function useToggleMilestone() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.toggleMilestone(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });
}
