import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { goalsApi } from '@/features/goals/api/goals.api';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';
import { CommitmentFormValues } from '../models/commitment.schema';
import { CommitmentModel } from '../models/commitment.model';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useCreateCommitment() {
  const queryClient = useQueryClient();
  const { identityId } = useSession();

  return useMutation({
    mutationFn: async (values: CommitmentFormValues) => {
      // id/identityId generated client-side, mirroring useCreateHabit() — the
      // real backend requires both in the body (TECH_DEBT.md Item 40; the
      // previous version of this hook never sent them, so real-mode creation
      // would 400).
      const result = await commitmentsApi.create({
        id: generateId(),
        identityId: identityId ?? '',
        title: values.title,
        description: values.description || undefined,
        targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
        recurrencePattern: values.recurrence !== 'none' ? values.recurrence || undefined : undefined,
        priority: values.priority,
      });

      // Commitment doesn't own the Goal relationship on the real backend —
      // Goal.commitmentIds[] does (TECH_DEBT.md Item 10, Fase 4B). Link as a
      // follow-up call, sequential (not Promise.all — see
      // demo_mode_concurrent_write_hazard), same pattern EditCommitmentScreen
      // already used for the old relinkGoal flow.
      if (values.goalId) {
        await goalsApi.linkCommitment(values.goalId, result.commitmentId);
      }

      return result;
    },
    onMutate: async (newCommitment) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.commitments.list() });

      // Snapshot the previous value
      const previousCommitments = queryClient.getQueryData(queryKeys.commitments.list());

      // Optimistically update to the new value
      const optimisticCommitment: CommitmentModel = {
        id: Math.random().toString(), // temporary ID
        title: newCommitment.title,
        description: newCommitment.description || undefined,
        status: 'active', // default status
        priority: newCommitment.priority || 'medium',
        targetDate: newCommitment.targetDate ? newCommitment.targetDate.toISOString() : undefined,
        goalId: newCommitment.goalId ?? undefined,
      };

      queryClient.setQueryData(queryKeys.commitments.list(), (old: any) => {
        if (!old) return [optimisticCommitment];
        return [optimisticCommitment, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousCommitments };
    },
    onError: (err, newCommitment, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCommitments) {
        queryClient.setQueryData(queryKeys.commitments.list(), context.previousCommitments);
      }
    },
    onSettled: () => {
      // Invalidate the cache to trigger a refetch of the list and get real IDs
      queryClient.invalidateQueries({ queryKey: queryKeys.commitments.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}
