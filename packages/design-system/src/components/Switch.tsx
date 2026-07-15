import React from 'react';
import { View, Switch as TamaguiSwitch, XStack, YStack } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Label, Caption } from './typography/index.js';
import { useInteractionState, useHapticBehavior, FocusRing, useInteractionAnimation } from '../interaction/index.js';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  labelI18nKey?: string;
  descriptionI18nKey?: string;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  accessibilityValue?: string;
  testID?: string;
}

export const Switch = React.forwardRef<any, SwitchProps>(({
  checked,
  onCheckedChange,
  labelI18nKey,
  descriptionI18nKey,
  loading = false,
  disabled = false,
  haptic = true,
  accessibilityValue,
  testID,
}, ref) => {
  const { t } = useTranslation();
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
  });

  useHapticBehavior({
    ...state,
    pressed: haptic ? state.pressed : false,
  });

  const animationStyle = useInteractionAnimation(state);

  const handleCheckedChange = (val: boolean) => {
    if (isActuallyDisabled) return;
    onCheckedChange(val);
  };

  const id = React.useId();
  const descriptionId = `${id}-desc`;

  return (
    <XStack gap="$3" alignItems="center" opacity={animationStyle.opacity} scale={animationStyle.scale}>
      <FocusRing state={state} borderRadius="$4" offset={2}>
        <View
          onPressIn={handlers.onPressIn}
          onPressOut={handlers.onPressOut}
          onMouseEnter={handlers.onHoverIn}
          onMouseLeave={handlers.onHoverOut}
          onFocus={handlers.onFocus}
          onBlur={handlers.onBlur}
        >
          <TamaguiSwitch
            ref={ref as any}
            testID={testID}
            id={id}
            size="$3"
            checked={checked}
            onCheckedChange={handleCheckedChange}
            disabled={isActuallyDisabled}
            backgroundColor={checked ? '$interactive' : '$surfaceRaised'}
            borderColor={checked ? '$interactive' : '$divider'}
            borderWidth={1}
            accessibilityRole="switch"
            accessibilityState={{ checked, disabled: isActuallyDisabled, busy: loading }}
            accessibilityLabel={labelI18nKey ? t(labelI18nKey) : undefined}
            accessibilityValue={accessibilityValue ? { text: accessibilityValue } : undefined}
            aria-describedby={descriptionI18nKey ? descriptionId : undefined}
          >
            <TamaguiSwitch.Thumb backgroundColor="#FFFFFF" />
          </TamaguiSwitch>
        </View>
      </FocusRing>

      {(labelI18nKey || descriptionI18nKey) && (
        <YStack flex={1}>
          {labelI18nKey && (
            <Label
              id={id + '-label'}
              i18nKey={labelI18nKey}
              color={isActuallyDisabled ? '$contentTertiary' : '$contentPrimary'}
            />
          )}
          {descriptionI18nKey && (
            <Caption
              id={descriptionId}
              i18nKey={descriptionI18nKey}
              color="$contentSecondary"
              marginTop="$1"
            />
          )}
        </YStack>
      )}
    </XStack>
  );
});

Switch.displayName = 'Switch';
