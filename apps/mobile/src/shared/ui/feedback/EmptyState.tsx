import { YStack } from 'tamagui';
import { Title, Body } from '@commitment/design-system';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
      <Title fontSize="$6" fontWeight="bold" textAlign="center">
        {title}
      </Title>
      <Body tone="secondary" fontSize="$4" textAlign="center">
        {description}
      </Body>
    </YStack>
  );
}
