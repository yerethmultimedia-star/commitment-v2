import { XStack } from 'tamagui';
import { Body, toPlatformAccessibilityProps } from '@commitment/design-system';

interface FilterChipProps {
  active: boolean;
  label: string;
  count: number;
  onPress: () => void;
}

/**
 * Task List UX round §3 "Visual Priority" — the active chip must stand
 * out clearly without an aggressive color, using the same semantic tokens
 * as everything else in the Design System ($interactive/$contentOnAccent
 * for active, $surfaceRaised/$divider for inactive — the exact pairing
 * Button's own primary/secondary variants already use), not a bespoke
 * bright color invented for this component.
 */
export function FilterChip({ active, label, count, onPress }: FilterChipProps) {
  return (
    <XStack
      onPress={onPress}
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$full"
      backgroundColor={active ? '$interactive' : '$surfaceRaised'}
      borderWidth={1}
      borderColor={active ? '$interactive' : '$divider'}
      alignItems="center"
      gap="$1"
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
      {...toPlatformAccessibilityProps({
        accessibilityRole: 'button',
        accessibilityState: { selected: active },
        accessibilityLabel: `${label} (${count})`,
      })}
    >
      <Body fontSize="$3" fontWeight={active ? '700' : '500'} color={active ? '$contentOnAccent' : '$contentSecondary'}>
        {label}
      </Body>
      <Body fontSize="$2" color={active ? '$contentOnAccent' : '$contentTertiary'}>
        {count}
      </Body>
    </XStack>
  );
}
