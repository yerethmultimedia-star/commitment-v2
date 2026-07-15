import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { queryKeys } from '@/core/query/query-keys';
import { CommitmentFormValues } from '../models/commitment.schema';
import { CommitmentModel } from '../models/commitment.model';

export function useCreateCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CommitmentFormValues) => {
      // We map the form values to the backend DTO payload
      return commitmentsApi.create({
        title: values.title,
        description: values.description || undefined,
        targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
        recurrencePattern: values.recurrence !== 'none' ? values.recurrence || undefined : undefined,
        priority: values.priority,
      });
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
        status: 'active', // default status
        priority: newCommitment.priority || 'medium',
        targetDate: newCommitment.targetDate ? newCommitment.targetDate.toISOString() : undefined,
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
    },
  });
}
