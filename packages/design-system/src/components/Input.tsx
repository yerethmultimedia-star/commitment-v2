import React, { useState } from 'react';
import { View, Input as TamaguiInput, YStack, XStack } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Label, Caption, Body } from './typography/index.js';
import { useInteractionState, useHapticBehavior, FocusRing } from '../interaction/index.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  labelI18nKey?: string;
  helperI18nKey?: string;
  placeholderI18nKey?: string;
  /** Accessible name when there's no visible labelI18nKey (e.g. a placeholder-only field) — ignored if labelI18nKey is set, since the visible Label already supplies one. */
  accessibilityLabelI18nKey?: string;
  error?: boolean;
  success?: boolean;
  counter?: { current: number; max: number };
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  passwordVisibility?: boolean; // If true, automatically handles type="password" and toggle
  clear?: boolean;
  formatter?: (text: string) => string;
  parser?: (text: string) => string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  autoComplete?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const Input = React.forwardRef<any, InputProps>(({
  value,
  onChangeText,
  labelI18nKey,
  helperI18nKey,
  placeholderI18nKey,
  accessibilityLabelI18nKey,
  error = false,
  success = false,
  counter,
  leadingIcon,
  trailingIcon,
  prefix,
  suffix,
  passwordVisibility = false,
  clear = false,
  formatter,
  parser,
  inputMode,
  autoComplete,
  keyboardType,
  returnKeyType,
  disabled = false,
  loading = false,
  testID,
  onFocus,
  onBlur,
}, ref) => {
  const { t } = useTranslation();
  const isActuallyDisabled = disabled || loading;
  const [showPassword, setShowPassword] = useState(false);

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    error,
    success,
  });

  useHapticBehavior(state);

  const handleChangeText = (text: string) => {
    let newText = text;
    if (parser) {
      newText = parser(newText);
    }
    if (formatter) {
      newText = formatter(newText);
    }
    onChangeText(newText);
  };

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
          flexDirection="row"
          alignItems="center"
          backgroundColor="$surfaceRaised"
          borderWidth={1}
          borderColor={borderColor as any}
          borderRadius="$4"
          paddingHorizontal="$3"
          height={48}
        >
          {leadingIcon && <View marginRight="$2">{leadingIcon}</View>}
          {prefix && <Body color="$contentSecondary" marginRight="$2">{prefix}</Body>}

          <TamaguiInput
            ref={ref as any}
            id={id}
            testID={testID}
            flex={1}
            height="100%"
            backgroundColor="transparent"
            borderWidth={0}
            padding={0}
            color="$contentPrimary"
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholderI18nKey ? t(placeholderI18nKey) : undefined}
            placeholderTextColor="$contentTertiary"
            secureTextEntry={passwordVisibility && !showPassword}
            inputMode={inputMode as any}
            autoComplete={autoComplete as any}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            disabled={isActuallyDisabled}
            {...toPlatformAccessibilityProps({
              accessibilityState: { disabled: isActuallyDisabled },
              accessibilityLabel: labelI18nKey ? t(labelI18nKey) : accessibilityLabelI18nKey ? t(accessibilityLabelI18nKey) : undefined,
            })}
            {...(labelI18nKey ? ({ 'aria-labelledby': id + '-label' } as any) : {})}
            aria-describedby={helperI18nKey ? helperId : undefined}
            onFocus={() => {
              handlers.onFocus();
              onFocus?.();
            }}
            onBlur={() => {
              handlers.onBlur();
              onBlur?.();
            }}
            onMouseEnter={handlers.onHoverIn}
            onMouseLeave={handlers.onHoverOut}
          />

          {suffix && <Body color="$contentSecondary" marginLeft="$2">{suffix}</Body>}
          
          {/* Action icons like clear or password toggle would be rendered here, but for now we just show trailingIcon */}
          {passwordVisibility && (
            <View marginLeft="$2" cursor="pointer" onPress={() => setShowPassword(!showPassword)}>
              <Caption>{showPassword ? 'Hide' : 'Show'}</Caption>
            </View>
          )}
          {clear && value.length > 0 && (
            <View marginLeft="$2" cursor="pointer" onPress={() => onChangeText('')}>
              <Body>✕</Body>
            </View>
          )}
          {trailingIcon && <View marginLeft="$2">{trailingIcon}</View>}
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

Input.displayName = 'Input';
