import React from 'react';
import { View, YStack } from 'tamagui';
import { Label } from './typography/index.js';
import { useInteractionState, useHapticBehavior, useInteractionAnimation, FocusRing } from '../interaction/index.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

export interface SelectableFieldProps {
  labelI18nKey?: string;
  label?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  /**
   * Omit when the field's interactivity comes from something layered inside
   * `children` instead (e.g. a native web `<input>` overlay) — the row
   * still gets full visual/focus chrome, it just isn't itself the thing
   * that receives the press.
   */
  onPress?: () => void;
  /** Value text, placeholder text, or a platform-specific interactive overlay (e.g. a transparent native input on web) — the field owns none of this itself. */
  children: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  /** Defaults to 'button' when onPress is set, undefined otherwise — override for a field whose interactivity lives in children (e.g. omit so a wrapped native input keeps its own implicit role). */
  accessibilityRole?: string;
}

/**
 * The one shared "field that opens a selector" chrome for the whole app —
 * same bordered/labeled/stateful visual language as Input/Button (same
 * useInteractionState/FocusRing/useHapticBehavior/useInteractionAnimation
 * wiring), so a date picker, a time picker, or any future selector field
 * (color, icon, priority, etc.) never needs its own bespoke look. Registered
 * 2026-07-19 per the "Independent Date/Time Fields" design principle
 * (ENGINEERING_BOARD.md) after date/time fields were found to look like
 * static labels instead of interactive controls — this is the fix,
 * generalized past just dates since the same affordance problem applies to
 * any "tap to pick something" field.
 */
export const SelectableField = React.forwardRef<any, SelectableFieldProps>(({
  labelI18nKey,
  label,
  leadingIcon,
  trailingIcon,
  disabled = false,
  error = false,
  onPress,
  children,
  testID,
  accessibilityLabel,
  accessibilityRole,
}, ref) => {
  const resolvedLabel = label ?? labelI18nKey;
  const { state, handlers } = useInteractionState({ disabled, error });
  useHapticBehavior(state);
  const animationStyle = useInteractionAnimation(state);

  let borderColor = '$divider';
  if (state.focused) borderColor = '$focus';
  if (error) borderColor = '$danger';

  const id = React.useId();
  const resolvedRole = accessibilityRole ?? (onPress ? 'button' : undefined);

  return (
    <YStack gap="$2" width="100%">
      {resolvedLabel && (
        <Label id={id + '-label'} color={error ? '$danger' : '$contentPrimary'}>
          {resolvedLabel}
        </Label>
      )}

      <FocusRing state={state} borderRadius="$4" stretch>
        <View
          ref={ref as any}
          testID={testID}
          position="relative"
          flexDirection="row"
          alignItems="center"
          backgroundColor="$surfaceRaised"
          borderWidth={1}
          borderColor={borderColor as any}
          borderRadius="$4"
          paddingHorizontal="$3"
          height={48}
          opacity={animationStyle.opacity}
          scale={animationStyle.scale}
          transition={animationStyle.transition}
          cursor={onPress && !disabled ? 'pointer' : undefined}
          onPress={onPress && !disabled ? onPress : undefined}
          onPressIn={onPress ? handlers.onPressIn : undefined}
          onPressOut={onPress ? handlers.onPressOut : undefined}
          onMouseEnter={handlers.onHoverIn}
          onMouseLeave={handlers.onHoverOut}
          onFocus={handlers.onFocus}
          onBlur={handlers.onBlur}
          {...toPlatformAccessibilityProps({
            accessibilityRole: resolvedRole,
            accessibilityLabel: accessibilityLabel ?? resolvedLabel,
            accessibilityState: { disabled },
          })}
          {...(resolvedLabel ? ({ 'aria-labelledby': id + '-label' } as any) : {})}
        >
          {leadingIcon && <View marginRight="$2">{leadingIcon}</View>}
          <View flex={1}>{children}</View>
          {trailingIcon && <View marginLeft="$2">{trailingIcon}</View>}
        </View>
      </FocusRing>
    </YStack>
  );
});

SelectableField.displayName = 'SelectableField';
