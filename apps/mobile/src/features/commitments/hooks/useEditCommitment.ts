import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { queryKeys } from '@/core/query/query-keys';
import { CommitmentFormValues } from '../models/commitment.schema';
import { CommitmentModel } from '../models/commitment.model';

export function useEditCommitment(commitmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CommitmentFormValues) => {
      return commitmentsApi.edit(commitmentId, {
        title: values.title,
        description: values.description || undefined,
        targetDate: values.targetDate ? values.targetDate.toISOString() : null,
        recurrencePattern: values.recurrence !== 'none' ? values.recurrence || null : null,
      });
    },
    onMutate: async (newValues) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.commitments.detail(commitmentId) });
      const previous = queryClient.getQueryData<CommitmentModel>(
        queryKeys.commitments.detail(commitmentId),
      );

      // Optimistically apply the edits to the detail cache
      queryClient.setQueryData<CommitmentModel>(
        queryKeys.commitments.detail(commitmentId),
        (old) =>
          old
            ? {
                ...old,
                title: newValues.title,
                targetDate: newValues.targetDate?.toISOString() ?? old.targetDate,
                recurrencePattern:
                  newValues.recurrence !== 'none' ? newValues.recurrence ?? old.recurrencePattern : undefined,
              }
            : old,
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.commitments.detail(commitmentId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commitments.detail(commitmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.commitments.list() });
    },
  });
}
