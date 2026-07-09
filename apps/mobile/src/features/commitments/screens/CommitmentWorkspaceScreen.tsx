import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, ScrollView, Text, Button } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCommitment } from '../hooks/useCommitment';
import { useCommitmentActions } from '../hooks/useCommitmentActions';
import { getAllowedActions, isEditable, type ActionConfig } from '@/shared/domain/commitmentActions';
import { CommitmentStatusBadge } from '../components/CommitmentStatusBadge';
import { CommitmentActionBar } from '../components/CommitmentActionBar';
import { CommitmentMetadata } from '../components/CommitmentMetadata';
import { CommitmentHistory } from '../components/history';
import { ConfirmationDialog } from '@/shared/ui/ConfirmationDialog';
import { LoadingState } from '@/shared/ui/feedback/LoadingState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';

export function CommitmentWorkspaceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: commitment, isLoading, isError, refetch } = useCommitment(id);
  const actions = useCommitmentActions(id);
  const [confirmingAction, setConfirmingAction] = useState<ActionConfig | null>(null);

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

  const allowedActions = getAllowedActions(commitment.status);

  const handleAction = (action: ActionConfig) => {
    if (action.requiresConfirmation) {
      setConfirmingAction(action);
      return;
    }
    executeAction(action);
  };

  const executeAction = (action: ActionConfig) => {
    setConfirmingAction(null);
    const mutation = actions[action.id];
    mutation.mutate(undefined, {
      onSuccess: () => {
        if (action.id === 'cancel') {
          router.replace('/(tabs)');
        }
      },
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen
        options={{
          title: commitment.title,
          headerBackTitle: t('common.back', { ns: 'common' }),
          headerRight: isEditable(commitment.status)
            ? () => (
                <Button
                  size="$2"
                  chromeless
                  onPress={() => router.push(`/commitments/${id}/edit` as any)}
                  accessibilityLabel={t('edit.headerButton', { ns: 'commitments' })}
                >
                  <Text color="$blue10" fontWeight="600">
                    {t('edit.headerButton', { ns: 'commitments' })}
                  </Text>
                </Button>
              )
            : undefined,
        }}
      />

      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5">
          {/* Header */}
          <YStack gap="$3">
            <Text fontSize="$8" fontWeight="bold" color="$text">
              {commitment.title}
            </Text>
            <CommitmentStatusBadge status={commitment.status} />
          </YStack>

          {/* Metadata section */}
          <CommitmentMetadata commitment={commitment} />

          {/* Action Bar */}
          {allowedActions.length > 0 && (
            <YStack gap="$2">
              <Text fontSize="$3" color="$textSecondary" fontWeight="bold" textTransform="uppercase">
                {t('workspace.actions.label', { ns: 'commitments' })}
              </Text>
              <CommitmentActionBar
                actions={allowedActions}
                onAction={handleAction}
                pendingAction={actions.pendingAction}
              />
            </YStack>
          )}

          {/* History */}
          <YStack gap="$2" marginTop="$4">
            <Text fontSize="$3" color="$textSecondary" fontWeight="bold" textTransform="uppercase">
              {t('activity.title', { ns: 'commitments' })}
            </Text>
            <CommitmentHistory commitmentId={commitment.id} />
          </YStack>
        </YStack>
      </ScrollView>

      {/* Confirmation Dialog */}
      {confirmingAction && (
        <ConfirmationDialog
          title={t(`workspace.confirm.${confirmingAction.id}.title`, { ns: 'commitments' })}
          description={t(`workspace.confirm.${confirmingAction.id}.description`, {
            ns: 'commitments',
            title: commitment.title,
          })}
          confirmLabel={t(confirmingAction.labelKey, { ns: 'commitments' })}
          cancelLabel={t('common.cancel', { ns: 'common' })}
          destructive={confirmingAction.destructive}
          onConfirm={() => executeAction(confirmingAction)}
          onCancel={() => setConfirmingAction(null)}
        />
      )}
    </YStack>
  );
}
