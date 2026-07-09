import { XStack, YStack } from 'tamagui';
import { CommitmentModel } from '../models/commitment.model';
import { CommitmentStatusBadge } from './CommitmentStatusBadge';
import { CommitmentTitle } from './CommitmentTitle';
import { CommitmentTargetDate } from './CommitmentTargetDate';

interface Props {
  commitment: CommitmentModel;
}

export function CommitmentCard({ commitment }: Props) {
  return (
    <YStack 
      backgroundColor="$backgroundElement" 
      padding="$4" 
      borderRadius="$4" 
      gap="$2"
      accessibilityRole="button"
      accessibilityLabel={commitment.title}
      accessibilityState={{ 
        disabled: commitment.status === 'cancelled',
        selected: false,
      }}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
        <YStack flex={1} gap="$1">
          <CommitmentTitle title={commitment.title} />
          <CommitmentTargetDate date={commitment.targetDate} />
        </YStack>
        <CommitmentStatusBadge status={commitment.status} />
      </XStack>
    </YStack>
  );
}
