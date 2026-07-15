import { YStack, Text, XStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { dateFormatter } from '@/shared/lib/dateFormatter';
import type { CommitmentModel } from '../models/commitment.model';

interface Props {
  commitment: CommitmentModel;
}

interface MetadataRowProps {
  label: string;
  value: string;
}

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">
        {label}
      </Text>
      <Text color="$contentPrimary" fontSize="$3">
        {value}
      </Text>
    </XStack>
  );
}

export function CommitmentMetadata({ commitment }: Props) {
  const { t } = useTranslation();

  return (
    <YStack
      backgroundColor="$surfaceRaised"
      borderRadius="$4"
      padding="$4"
      gap="$1"
    >
      {commitment.targetDate && (
        <MetadataRow
          label={t('workspace.metadata.targetDate', { ns: 'commitments' })}
          value={dateFormatter.formatDate(commitment.targetDate)}
        />
      )}

      {commitment.recurrencePattern && (
        <MetadataRow
          label={t('workspace.metadata.recurrence', { ns: 'commitments' })}
          value={t(
            `form.fields.recurrence.options.${commitment.recurrencePattern}`,
            { ns: 'commitments' },
          )}
        />
      )}

      {!commitment.targetDate && !commitment.recurrencePattern && (
        <Text color="$contentSecondary" fontSize="$3" textAlign="center" paddingVertical="$2">
          {t('workspace.metadata.empty', { ns: 'commitments' })}
        </Text>
      )}
    </YStack>
  );
}
