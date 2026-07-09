import { YStack, Text } from 'tamagui';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
      <Text fontSize="$6" fontWeight="bold" color="$text" textAlign="center">
        {title}
      </Text>
      <Text fontSize="$4" color="$textSecondary" textAlign="center">
        {description}
      </Text>
    </YStack>
  );
}
