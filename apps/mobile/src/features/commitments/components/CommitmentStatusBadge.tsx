import { Text, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { CommitmentStatus } from '../models/commitment.model';
import { commitmentMapper } from '../mappers/commitment.mapper';

interface Props {
  status: CommitmentStatus;
}

export function CommitmentStatusBadge({ status }: Props) {
  const { t } = useTranslation();

  const getColors = () => {
    switch (status) {
      case 'active':
        return { bg: '$green5', text: '$green10' };
      case 'draft':
        return { bg: '$gray5', text: '$gray10' };
      case 'paused':
        return { bg: '$orange5', text: '$orange10' };
      case 'completed':
        return { bg: '$blue5', text: '$blue10' };
      case 'cancelled':
        return { bg: '$red5', text: '$red10' };
      default:
        return { bg: '$gray5', text: '$gray10' };
    }
  };

  const { bg, text } = getColors();

  return (
    <YStack backgroundColor={bg} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4">
      <Text color={text} fontSize="$2" fontWeight="bold">
        {t(commitmentMapper.statusToTranslationKey(status), { ns: 'commitments' })}
      </Text>
    </YStack>
  );
}
