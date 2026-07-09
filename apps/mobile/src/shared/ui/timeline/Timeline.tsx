import { YStack } from 'tamagui';

export interface TimelineProps {
  children: React.ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return (
    <YStack gap="$4" marginLeft="$2">
      {children}
    </YStack>
  );
}
