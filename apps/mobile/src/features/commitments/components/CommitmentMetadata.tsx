import { YStack, XStack } from 'tamagui';
import { Body } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { dateFormatter } from '@/shared/lib/dateFormatter';
import type { CommitmentModel } from '../models/commitment.model';

interface Props {
  commitment: CommitmentModel;
}

interface MetadataRowProps {
  labelI18nKey: string;
  value: string;
}

function MetadataRow({ labelI18nKey, value }: MetadataRowProps) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <Body color="$contentSecondary" fontSize="$3" fontWeight="bold" i18nKey={labelI18nKey} i18nParams={{ ns: 'commitments' }} />
      <Body color="$contentPrimary" fontSize="$3">
        {value}
      </Body>
    </XStack>
  );
}

export function CommitmentMetadata({ commitment }: Props) {
  // Still needed for the recurrence VALUE (a dynamic key resolved to a plain
  // string, not renderable via a single i18nKey prop since it's paired with
  // a sibling label in the same row).
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
          labelI18nKey="workspace.metadata.targetDate"
          value={dateFormatter.formatDate(commitment.targetDate)}
        />
      )}

      {commitment.recurrencePattern && (
        <MetadataRow
          labelI18nKey="workspace.metadata.recurrence"
          value={t(
            `form.fields.recurrence.options.${commitment.recurrencePattern}`,
            { ns: 'commitments' },
          )}
        />
      )}

      {!commitment.targetDate && !commitment.recurrencePattern && (
        <Body
          color="$contentSecondary"
          fontSize="$3"
          textAlign="center"
          paddingVertical="$2"
          i18nKey="workspace.metadata.empty"
          i18nParams={{ ns: 'commitments' }}
        />
      )}
    </YStack>
  );
}
