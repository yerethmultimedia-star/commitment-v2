import { YStack, Text, Button } from 'tamagui';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}

export function ErrorState({ message, onRetry, retryLabel }: ErrorStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
      <Text fontSize="$5" color="$danger" textAlign="center">
        {message}
      </Text>
      <Button theme="active" onPress={onRetry}>
        {retryLabel}
      </Button>
    </YStack>
  );
}
