import { Text } from 'tamagui';
import { dateFormatter } from '@/shared/lib/dateFormatter';

interface Props {
  date?: string;
}

export function CommitmentTargetDate({ date }: Props) {
  if (!date) return null;

  return (
    <Text color="$textSecondary" fontSize="$3">
      {dateFormatter.formatDate(date)}
    </Text>
  );
}
