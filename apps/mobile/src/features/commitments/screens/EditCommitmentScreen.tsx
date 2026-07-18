import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, ScrollView } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Title } from '@commitment/design-system';
import { useCommitment } from '../hooks/useCommitment';
import { useEditCommitment } from '../hooks/useEditCommitment';
import { useRelinkCommitmentGoal } from '../hooks/useRelinkCommitmentGoal';
import { useLinkCommitmentToGoal } from '@/features/goals/hooks/useGoals';
import { getEditableFields } from '@/shared/domain/commitmentActions';
import { CommitmentForm } from '../components/forms/CommitmentForm';
import { CommitmentFormValues } from '../models/commitment.schema';
import { LoadingState } from '@/shared/ui/feedback/LoadingState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';
import { CommitmentStatusBadge } from '../components/CommitmentStatusBadge';

const ALL_FIELDS = ['title', 'goalId', 'description', 'targetDate', 'recurrence', 'priority'];

export function EditCommitmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: commitment, isLoading, isError, refetch } = useCommitment(id);
  const { mutateAsync, isPending } = useEditCommitment(id);
  const relinkGoal = useRelinkCommitmentGoal();
  const linkCommitmentToGoal = useLinkCommitmentToGoal();

  // Derive the non-editable fields declaratively — no if/else in the component
  const disabledFields = useMemo(() => {
    if (!commitment) return ALL_FIELDS;
    const editable = getEditableFields(commitment.status);
    return ALL_FIELDS.filter((f) => !editable.includes(f as any));
  }, [commitment]);

  if (isLoading) return <LoadingState />;
  if (isError || !commitment) {
    return (
      <ErrorState
        message={t('workspace.error', { ns: 'commitments' })}
        retryLabel={t('list.error.retry', { ns: 'commitments' })}
        onRetry={refetch}
      />
    );
  }

  const initialValues: Partial<CommitmentFormValues> = {
    title: commitment.title,
    targetDate: commitment.targetDate ? new Date(commitment.targetDate) : null,
    recurrence: (commitment.recurrencePattern as any) ?? 'none',
    priority: commitment.priority,
    goalId: commitment.goalId ?? null,
  };

  const handleSubmit = async (values: CommitmentFormValues) => {
    // Optimistic nav — same pattern as CreateCommitmentScreen
    router.replace(`/commitments/${id}` as any);
    // Sequential, not Promise.all — both mutations do a read-modify-write
    // against the same demo-mode record with no locking; firing them
    // concurrently caused a real lost-update bug for Habits (see
    // useRelinkHabitGoal), fixed there by always awaiting in order.
    mutateAsync(values)
      .then(async () => {
        if (values.goalId === (commitment.goalId ?? null)) return;
        if (values.goalId) {
          // Commitment doesn't own this relationship on the real backend —
          // Goal.commitmentIds[] does (TECH_DEBT.md Item 10, Fase 4B).
          await linkCommitmentToGoal.mutateAsync({ goalId: values.goalId, commitmentId: id });
          return;
        }
        // Unlinking (goalId -> null): no backend "unlink" command exists yet
        // for Goal.commitmentIds[] — relinkGoal still handles this correctly
        // in Demo Mode (clears Commitment.goalId there), but is a documented
        // no-op gap against the real backend until that command exists.
        await relinkGoal.mutateAsync({ id, goalId: null });
      })
      .catch(() => {
        // A toast will be shown here in VS-030 (offline/feedback layer)
      });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen
        options={{
          title: t('edit.title', { ns: 'commitments' }),
          headerBackTitle: t('common.back', { ns: 'common' }),
        }}
      />
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5" paddingBottom="$10">
          {/* Status context — so the user knows why some fields are locked */}
          <YStack gap="$2">
            <Title fontSize="$7" fontWeight="bold">
              {commitment.title}
            </Title>
            <CommitmentStatusBadge status={commitment.status} />
          </YStack>

          <CommitmentForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            disabledFields={disabledFields}
            submitLabelI18nKey="commitments:edit.submit"
          />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
