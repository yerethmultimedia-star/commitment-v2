import React from 'react';
import { View, TextArea as TamaguiTextArea, YStack, XStack } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Label, Caption } from './typography/index.js';
import { useInteractionState, useHapticBehavior, useInteractionAnimation, FocusRing } from '../interaction/index.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

export interface TextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  labelI18nKey?: string;
  helperI18nKey?: string;
  placeholderI18nKey?: string;
  error?: boolean;
  success?: boolean;
  counter?: { current: number; max: number };
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  numberOfLines?: number;
}

export const TextArea = React.forwardRef<any, TextAreaProps>(({
  value,
  onChangeText,
  labelI18nKey,
  helperI18nKey,
  placeholderI18nKey,
  error = false,
  success = false,
  counter,
  disabled = false,
  loading = false,
  testID,
  numberOfLines = 4,
}, ref) => {
  const { t } = useTranslation();
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    error,
    success,
  });

  useHapticBehavior(state);
  const animationStyle = useInteractionAnimation(state);

  const id = React.useId();
  const helperId = `${id}-helper`;

  let borderColor = '$divider';
  if (state.focused) borderColor = '$focus';
  if (error) borderColor = '$danger';
  if (success) borderColor = '$success';

  return (
    <YStack gap="$2" opacity={isActuallyDisabled ? animationStyle.opacity : 1}>
      {/* Label and Counter */}
      <XStack justifyContent="space-between" alignItems="center">
        {labelI18nKey && (
          <Label
            id={id + '-label'}
            i18nKey={labelI18nKey}
            color={error ? '$danger' : '$contentPrimary'}
          />
        )}
        {counter && (
          <Caption color={counter.current > counter.max ? '$danger' : '$contentSecondary'}>
            {`${counter.current} / ${counter.max}`}
          </Caption>
        )}
      </XStack>

      <FocusRing state={state} borderRadius="$4">
        <View
          backgroundColor="$surfaceRaised"
          borderWidth={1}
          borderColor={borderColor as any}
          borderRadius="$4"
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <TamaguiTextArea
            ref={ref as any}
            id={id}
            testID={testID}
            backgroundColor="transparent"
            borderWidth={0}
            padding={0}
            color="$contentPrimary"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholderI18nKey ? t(placeholderI18nKey) : undefined}
            placeholderTextColor="$contentTertiary"
            disabled={isActuallyDisabled}
            numberOfLines={numberOfLines}
            minHeight={numberOfLines * 24}
            {...toPlatformAccessibilityProps({ accessibilityState: { disabled: isActuallyDisabled } })}
            aria-describedby={helperI18nKey ? helperId : undefined}
            onFocus={handlers.onFocus}
            onBlur={handlers.onBlur}
            onMouseEnter={handlers.onHoverIn}
            onMouseLeave={handlers.onHoverOut}
          />
        </View>
      </FocusRing>

      {/* Helper Text */}
      {helperI18nKey && (
        <Caption
          id={helperId}
          i18nKey={helperI18nKey}
          color={error ? '$danger' : success ? '$success' : '$contentSecondary'}
        />
      )}
    </YStack>
  );
});

TextArea.displayName = 'TextArea';
