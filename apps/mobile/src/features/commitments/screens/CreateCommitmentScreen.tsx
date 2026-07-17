import { useRouter, useLocalSearchParams } from 'expo-router';
import { YStack, ScrollView } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Title } from '@commitment/design-system';
import { CommitmentForm } from '../components/forms/CommitmentForm';
import { useCreateCommitment } from '../hooks/useCreateCommitment';
import { CommitmentFormValues } from '../models/commitment.schema';

export function CreateCommitmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutateAsync } = useCreateCommitment();
  // Goal Workspace's "Agregar compromiso" preloads this; the user can still change or clear it in the form — it's a starting point, not a lock.
  const { goalId: prefillGoalId } = useLocalSearchParams<{ goalId?: string }>();

  const handleSubmit = async (values: CommitmentFormValues) => {
    try {
      // Deterministic navigation: never depend on history stack.
      // This ensures correct behavior with deep links, notifications, and universal links.
      // Came from a Goal's workspace ("+" on its Commitments section) — return there, not Today.
      router.replace(prefillGoalId ? `/goals/${prefillGoalId}` : '/(tabs)');

      // Fire mutation in background — optimistic update already applied in
      // useCreateCommitment onMutate; onError reverts on failure.
      mutateAsync(values).catch(() => {
        // A toast will be shown here in VS-025 (offline/feedback layer)
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$4" gap="$6" paddingBottom="$10">
        <Title fontSize="$8" fontWeight="bold">
          {t('form.title', { ns: 'commitments' })}
        </Title>

        <CommitmentForm
          initialValues={prefillGoalId ? { goalId: prefillGoalId } : undefined}
          onSubmit={handleSubmit}
        />
      </YStack>
    </ScrollView>
  );
}
