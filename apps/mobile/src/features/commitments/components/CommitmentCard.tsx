import { XStack, YStack } from 'tamagui';
import { CommitmentModel } from '../models/commitment.model';
import { CommitmentStatusBadge } from './CommitmentStatusBadge';
import { CommitmentTitle } from './CommitmentTitle';
import { CommitmentTargetDate } from './CommitmentTargetDate';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
  commitment: CommitmentModel;
}

export function CommitmentCard({ commitment }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/commitments/${commitment.id}`)}
      accessibilityRole="button"
      accessibilityLabel={commitment.title}
    >
      <YStack
        backgroundColor="$backgroundElement"
        padding="$4"
        borderRadius="$4"
        gap="$2"
      >
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
          <YStack flex={1} gap="$1">
            <CommitmentTitle title={commitment.title} />
            <CommitmentTargetDate date={commitment.targetDate} />
          </YStack>
          <CommitmentStatusBadge status={commitment.status} />
        </XStack>
      </YStack>
    </Pressable>
  );
}
