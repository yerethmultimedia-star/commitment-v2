import { XStack, YStack } from 'tamagui';

export interface TimelineItemProps {
  accessibilityLabel: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  date: React.ReactNode;
  isLast?: boolean;
}

export function TimelineItem({ accessibilityLabel, icon, content, date, isLast }: TimelineItemProps) {
  return (
    <XStack gap="$3" accessibilityRole="text" accessibilityLabel={accessibilityLabel} focusable={true}>
      <YStack alignItems="center">
        {icon}
        {!isLast && (
          <YStack
            width={2}
            flex={1}
            backgroundColor="$color5"
            marginTop="$2"
            marginBottom="$-4"
          />
        )}
      </YStack>
      <YStack flex={1} paddingBottom="$4">
        {content}
        {date}
      </YStack>
    </XStack>
  );
}
