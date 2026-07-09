import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { queryKeys } from '@/core/query/query-keys';
import { CommitmentAction } from '@/shared/domain/commitmentActions';
import { commitmentMapper } from '../mappers/commitment.mapper';
import { CommitmentModel } from '../models/commitment.model';

/**
 * Provides all state-transition mutations for a single commitment.
 * Each mutation applies an optimistic update and rolls back on failure.
 */
export function useCommitmentActions(commitmentId: string) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<CommitmentAction | null>(null);

  const apiCallFor: Record<CommitmentAction, () => Promise<any>> = {
    activate: () => commitmentsApi.activate(commitmentId),
    pause:    () => commitmentsApi.pause(commitmentId),
    resume:   () => commitmentsApi.resume(commitmentId),
    complete: () => commitmentsApi.complete(commitmentId),
    cancel:   () => commitmentsApi.cancel(commitmentId),
  };

  // Maps backend state to our model status
  const stateToStatus = (state: string) =>
    commitmentMapper.fromDTO({ id: commitmentId, state, title: '' }).status;

  const buildMutation = (action: CommitmentAction) =>
    useMutation({
      mutationFn: apiCallFor[action],
      onMutate: async () => {
        setPendingAction(action);
        await queryClient.cancelQueries({ queryKey: queryKeys.commitments.detail(commitmentId) });
        const previous = queryClient.getQueryData<CommitmentModel>(queryKeys.commitments.detail(commitmentId));
        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKeys.commitments.detail(commitmentId), context.previous);
        }
        setPendingAction(null);
      },
      onSuccess: (result) => {
        // Optimistically set the new status in the detail cache
        queryClient.setQueryData<CommitmentModel>(
          queryKeys.commitments.detail(commitmentId),
          (old) => old ? { ...old, status: stateToStatus(result.state) } : old,
        );
        setPendingAction(null);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.commitments.detail(commitmentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.commitments.list() });
      },
    });

  return {
    pendingAction,
    activate: buildMutation('activate'),
    pause:    buildMutation('pause'),
    resume:   buildMutation('resume'),
    complete: buildMutation('complete'),
    cancel:   buildMutation('cancel'),
  };
}
