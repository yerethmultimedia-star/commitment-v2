import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, ScrollView } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Title } from '@commitment/design-system';
import { useCommitment } from '../hooks/useCommitment';
import { useEditCommitment } from '../hooks/useEditCommitment';
import { getEditableFields } from '@/shared/domain/commitmentActions';
import { CommitmentForm } from '../components/forms/CommitmentForm';
import { CommitmentFormValues } from '../models/commitment.schema';
import { LoadingState } from '@/shared/ui/feedback/LoadingState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';
import { CommitmentStatusBadge } from '../components/CommitmentStatusBadge';

export function EditCommitmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: commitment, isLoading, isError, refetch } = useCommitment(id);
  const { mutateAsync, isPending } = useEditCommitment(id);

  // Derive the non-editable fields declaratively — no if/else in the component
  const disabledFields = useMemo(() => {
    if (!commitment) return ['title', 'description', 'targetDate', 'recurrence', 'priority'];
    const editable = getEditableFields(commitment.status);
    const allFields = ['title', 'description', 'targetDate', 'recurrence', 'priority'];
    return allFields.filter((f) => !editable.includes(f as any));
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
  };

  const handleSubmit = async (values: CommitmentFormValues) => {
    // Optimistic nav — same pattern as CreateCommitmentScreen
    router.replace(`/commitments/${id}` as any);
    mutateAsync(values).catch(() => {
      // Toast in VS-030 (offline/feedback layer)
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
