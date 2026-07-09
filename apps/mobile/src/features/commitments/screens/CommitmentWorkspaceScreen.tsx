import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { Stack, Inline, Title, Body, Button, AppScreen, ConfirmationDialog } from '@commitment/design-system';
import { useCommitment } from '../hooks/useCommitment';
import { useCommitmentActions } from '../hooks/useCommitmentActions';
import { getAllowedActions, isEditable, type ActionConfig } from '@/shared/domain/commitmentActions';
import { CommitmentStatusBadge } from '../components/CommitmentStatusBadge';
import { CommitmentActionBar } from '../components/CommitmentActionBar';
import { CommitmentMetadata } from '../components/CommitmentMetadata';
import { CommitmentHistory } from '../components/history';
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
    <AppScreen scrollable={false}>
      <RouterStack.Screen
        options={{
          title: commitment.title,
          headerBackTitle: t('common:back'),
          headerRight: isEditable(commitment.status)
            ? () => (
                <Button
                  i18nKey="commitments:edit.headerButton"
                  variant="ghost"
                  size="small"
                  onPress={() => router.push(`/commitments/${id}/edit` as any)}
                />
              )
            : undefined,
        }}
      />

      <Stack padding="$md" gap="$lg">
        {/* Header */}
        <Stack gap="$sm">
          <Title>{commitment.title}</Title>
          <CommitmentStatusBadge status={commitment.status} />
        </Stack>

        {/* Metadata section */}
        <CommitmentMetadata commitment={commitment} />

        {/* Action Bar */}
        {allowedActions.length > 0 && (
          <Stack gap="$xs">
            <Body fontWeight="bold" tone="secondary" style={{ textTransform: 'uppercase' as any }}>
              {t('workspace.actions.label', { ns: 'commitments' })}
            </Body>
            <CommitmentActionBar
              actions={allowedActions}
              onAction={handleAction}
              pendingAction={actions.pendingAction}
            />
          </Stack>
        )}

        {/* History */}
        <Stack gap="$xs" marginTop="$md">
          <Body fontWeight="bold" tone="secondary" style={{ textTransform: 'uppercase' as any }}>
            {t('activity.title', { ns: 'commitments' })}
          </Body>
          <CommitmentHistory commitmentId={commitment.id} />
        </Stack>
      </Stack>

      {/* Confirmation Dialog */}
      {confirmingAction && (
        <ConfirmationDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setConfirmingAction(null);
          }}
          titleI18nKey={`commitments:workspace.confirm.${confirmingAction.id}.title`}
          descriptionI18nKey={`commitments:workspace.confirm.${confirmingAction.id}.description`}
          descriptionI18nParams={{ title: commitment.title }}
          confirmI18nKey={`commitments:${confirmingAction.labelKey}`}
          cancelI18nKey="common:cancel"
          destructive={confirmingAction.destructive}
          onConfirm={() => executeAction(confirmingAction)}
        />
      )}
    </AppScreen>
  );
}
