import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { queryKeys } from '@/core/query/query-keys';

/** Mirrors useRelinkHabitGoal — a relationship change, fired as its own mutation alongside the generic edit, not folded into it. */
export function useRelinkCommitmentGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, goalId }: { id: string; goalId: string | null }) => commitmentsApi.relinkGoal(id, goalId),
    onSuccess: (_data, { id }) => {
      client.invalidateQueries({ queryKey: queryKeys.commitments.list() });
      client.invalidateQueries({ queryKey: queryKeys.commitments.detail(id) });
    },
  });
}
