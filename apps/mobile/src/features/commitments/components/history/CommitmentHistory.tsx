import { useCommitmentHistory } from '../../hooks/useCommitmentHistory';
import { Timeline } from '@/shared/ui/timeline';
import { ActivityRenderer } from './ActivityRenderer';
import { Spinner, Text, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

export interface CommitmentHistoryProps {
  commitmentId: string;
}

export function CommitmentHistory({ commitmentId }: CommitmentHistoryProps) {
  const { data: history, isLoading, error } = useCommitmentHistory(commitmentId);
  const { t } = useTranslation('commitments');

  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center">
        <Spinner size="small" color="$color" />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text color="$red10">{t('errors.load_history_failed', 'Failed to load history')}</Text>
      </YStack>
    );
  }

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <Timeline>
      {history.map((activity, index) => (
        <ActivityRenderer
          key={activity.id}
          activity={activity}
          isLast={index === history.length - 1}
        />
      ))}
    </Timeline>
  );
}
