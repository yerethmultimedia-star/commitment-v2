import React from 'react';
import { View, Spinner } from 'tamagui';
import { t } from '@commitment/localization';
import { useInteractionState, useHapticBehavior, FocusRing, useInteractionAnimation } from '../interaction/index.js';

export interface IconButtonProps {
  /**
   * Minimum target size is enforced to 44x44 for accessibility.
   */
  size?: number; // Visual size of the icon/button, touch target is always >= 44
  iconToken: React.ReactNode; // e.g. <Icon name="settings" />
  tooltipI18nKey?: string;
  accessibilityHintI18nKey?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  tone?: 'normal' | 'error' | 'success' | 'warning';
  haptic?: boolean;
  testID?: string;
  onPress?: () => void;
}

export const IconButton = React.forwardRef<any, IconButtonProps>(({
  size = 24,
  iconToken,
  tooltipI18nKey,
  accessibilityHintI18nKey,
  loading = false,
  disabled = false,
  variant = 'ghost',
  tone = 'normal',
  haptic = true,
  testID,
  onPress,
}, ref) => {
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    error: tone === 'error',
    success: tone === 'success',
  });

  useHapticBehavior({
    ...state,
    // If haptic is disabled on this specific button, override the state
    pressed: haptic ? state.pressed : false,
  });

  const animationStyle = useInteractionAnimation(state);

  const handlePress = () => {
    if (isActuallyDisabled) return;
    if (onPress) onPress();
  };

  // Determine styling
  let bg = 'transparent';
  let borderColor = 'transparent';
  // Let the icon determine its color, or pass down context if necessary

  if (variant === 'primary') {
    bg = tone === 'error' ? '$danger' : '$interactive';
  } else if (variant === 'secondary') {
    bg = '$surfaceRaised';
  } else if (variant === 'outline') {
    borderColor = tone === 'error' ? '$danger' : '$divider';
  }

  // Minimum touch target 44x44
  const touchTargetSize = Math.max(44, size + 16);

  return (
    <FocusRing state={state} borderRadius="full">
      <View
        ref={ref as any}
        testID={testID}
        role="button"
        accessibilityRole="button"
        accessible={true}
        accessibilityState={{ disabled: isActuallyDisabled, busy: loading }}
        accessibilityLabel={tooltipI18nKey ? t(tooltipI18nKey) : undefined}
        accessibilityHint={accessibilityHintI18nKey ? t(accessibilityHintI18nKey) : undefined}
        width={touchTargetSize}
        height={touchTargetSize}
        borderRadius={touchTargetSize / 2}
        backgroundColor={bg as any}
        borderColor={borderColor as any}
        borderWidth={variant === 'outline' ? 1 : 0}
        alignItems="center"
        justifyContent="center"
        opacity={animationStyle.opacity}
        scale={animationStyle.scale}
        cursor={isActuallyDisabled ? 'not-allowed' : 'pointer'}
        onPress={handlePress}
        onPressIn={handlers.onPressIn}
        onPressOut={handlers.onPressOut}
        onMouseEnter={handlers.onHoverIn}
        onMouseLeave={handlers.onHoverOut}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
      >
        {loading ? (
          <Spinner size="small" />
        ) : (
          iconToken
        )}
      </View>
    </FocusRing>
  );
});

IconButton.displayName = 'IconButton';
