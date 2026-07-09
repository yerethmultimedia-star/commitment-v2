import { Text } from 'tamagui';

export interface TimelineDateProps {
  children: React.ReactNode;
}

export function TimelineDate({ children }: TimelineDateProps) {
  return (
    <Text fontSize="$3" color="$color10" marginTop="$1">
      {children}
    </Text>
  );
}
