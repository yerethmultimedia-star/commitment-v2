import { View, XStack, YStack } from 'tamagui';
import { Label } from './typography/index.js';
import { useInteractionState, useHapticBehavior, useInteractionAnimation, FocusRing } from '../interaction/index.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  disabled: boolean;
  stretch: boolean;
  onPress: () => void;
  testID?: string;
}

function ChoiceChip({ label, selected, disabled, stretch, onPress, testID }: ChoiceChipProps) {
  const { state, handlers } = useInteractionState({ disabled, selected });
  useHapticBehavior(state);
  const animationStyle = useInteractionAnimation(state);

  // Mirrors Button's own primary/outline variant tokens exactly — a chip
  // is a toggleable pill, not a new visual language: selected ≈ variant
  // "primary", unselected ≈ variant "outline".
  const bg = selected ? '$interactive' : 'transparent';
  const textColor = selected ? '$contentOnAccent' : '$contentPrimary';
  const borderColor = selected ? '$interactive' : '$divider';

  // FocusRing defaults to alignSelf: 'flex-start' (hugging its content) —
  // wrapping it in an outer flex={1} box, then telling FocusRing itself to
  // stretch to fill that box, is what actually lets 3 equal-width chips
  // share a row correctly. Passing flex={1} directly to the inner bordered
  // View alone silently collapses it, since FocusRing (its actual parent
  // in the flex row) never grows to make room for it.
  return (
    <View flex={stretch ? 1 : undefined}>
      <FocusRing state={state} borderRadius="$4" stretch={stretch}>
        <View
          testID={testID}
          width={stretch ? '100%' : undefined}
          height={32}
          paddingHorizontal="$3"
          borderRadius="$4"
          borderWidth={1}
          borderColor={borderColor as any}
          backgroundColor={bg as any}
          alignItems="center"
          justifyContent="center"
          opacity={animationStyle.opacity}
          scale={animationStyle.scale}
          transition={animationStyle.transition}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          onPress={disabled ? undefined : onPress}
          onPressIn={handlers.onPressIn}
          onPressOut={handlers.onPressOut}
          onMouseEnter={handlers.onHoverIn}
          onMouseLeave={handlers.onHoverOut}
          onFocus={handlers.onFocus}
          onBlur={handlers.onBlur}
          {...toPlatformAccessibilityProps({
            accessibilityRole: 'button',
            accessibilityLabel: label,
            accessibilityState: { selected, disabled },
          })}
        >
          <Label color={textColor as any}>{label}</Label>
        </View>
      </FocusRing>
    </View>
  );
}

export interface ChoiceGroupProps<T> {
  options: readonly T[];
  isSelected: (option: T) => boolean;
  onSelect: (option: T) => void;
  labelFor: (option: T) => string;
  isDisabled?: (option: T) => boolean;
  /** Defaults to String(option) — pass when T doesn't stringify uniquely (shouldn't normally be needed). */
  keyFor?: (option: T) => string;
  labelI18nKey?: string;
  label?: string;
  /** Equal-width chips filling the row (e.g. a 3-option priority selector) vs natural-width wrapping chips (e.g. duration presets). Default false (wrap). */
  stretch?: boolean;
  testID?: string;
}

/**
 * The one shared "row of toggleable option chips" component — TECH_DEBT.md
 * Item 44 (2026-07-19): this exact pattern was hand-rolled independently at
 * least 4 times (reminder presets/repeat/stop-condition, duration presets,
 * Task's priority selector, Task's relation-kind selector), none wired to
 * the interaction system `Input`/`Button`/`SelectableField`/`Switch` already
 * share — no focus ring, no haptics, no press/hover animation. This is the
 * fix: same `useInteractionState`/`FocusRing`/`useHapticBehavior`/
 * `useInteractionAnimation`/`Label` wiring, generalized over any option
 * type via `isSelected`/`onSelect`/`labelFor` rather than assuming a
 * simple `value === option` equality (DurationInput's "Custom…" chip isn't
 * itself a valid duration value, so it needs its own selection predicate).
 */
export function ChoiceGroup<T>({
  options,
  isSelected,
  onSelect,
  labelFor,
  isDisabled,
  keyFor,
  labelI18nKey,
  label,
  stretch = false,
  testID,
}: ChoiceGroupProps<T>) {
  const resolvedLabel = label ?? labelI18nKey;

  return (
    <YStack gap="$2" width="100%" testID={testID}>
      {resolvedLabel && <Label color="$contentPrimary">{resolvedLabel}</Label>}
      <XStack gap="$2" flexWrap={stretch ? undefined : 'wrap'}>
        {options.map((option) => (
          <ChoiceChip
            key={keyFor ? keyFor(option) : String(option)}
            label={labelFor(option)}
            selected={isSelected(option)}
            disabled={isDisabled ? isDisabled(option) : false}
            stretch={stretch}
            onPress={() => onSelect(option)}
          />
        ))}
      </XStack>
    </YStack>
  );
}

ChoiceGroup.displayName = 'ChoiceGroup';
