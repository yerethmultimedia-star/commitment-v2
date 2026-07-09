import React from 'react';
import { View, TextArea as TamaguiTextArea, Text, YStack, XStack } from 'tamagui';
import { t } from '@commitment/localization';
import { useInteractionState, useHapticBehavior, FocusRing } from '../interaction/index.js';

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
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    error,
    success,
  });

  useHapticBehavior(state);

  const id = React.useId();
  const helperId = `${id}-helper`;

  let borderColor = '$divider';
  if (state.focused) borderColor = '$focus';
  if (error) borderColor = '$danger';
  if (success) borderColor = '$success';

  return (
    <YStack gap="$2" opacity={isActuallyDisabled ? 0.5 : 1}>
      {/* Label and Counter */}
      <XStack justifyContent="space-between" alignItems="center">
        {labelI18nKey && (
          <Text
            id={id + '-label'}
            fontSize="$4"
            fontWeight="600"
            color={error ? '$danger' : '$contentPrimary'}
          >
            {t(labelI18nKey)}
          </Text>
        )}
        {counter && (
          <Text fontSize="$3" color={counter.current > counter.max ? '$danger' : '$contentSecondary'}>
            {counter.current} / {counter.max}
          </Text>
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
            accessibilityState={{ disabled: isActuallyDisabled }}
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
        <Text
          id={helperId}
          fontSize="$3"
          color={error ? '$danger' : success ? '$success' : '$contentSecondary'}
        >
          {t(helperI18nKey)}
        </Text>
      )}
    </YStack>
  );
});

TextArea.displayName = 'TextArea';
