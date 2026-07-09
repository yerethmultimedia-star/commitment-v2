import React from 'react';
import { View, ViewProps } from 'tamagui';
import { useInteractionState, useHapticBehavior, FocusRing, useInteractionAnimation } from '../interaction/index.js';

export type SurfaceVariant = 'flat' | 'elevated' | 'interactive' | 'selected' | 'outlined' | 'danger' | 'success';

export interface SurfaceProps extends ViewProps {
  variant?: SurfaceVariant;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const Surface = React.forwardRef<any, SurfaceProps>(({
  variant = 'flat',
  disabled = false,
  loading = false,
  haptic = true,
  onPress,
  children,
  ...props
}, ref) => {
  const isInteractive = variant === 'interactive' || variant === 'selected' || !!onPress;
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    selected: variant === 'selected',
    error: variant === 'danger',
    success: variant === 'success',
  });

  useHapticBehavior({
    ...state,
    pressed: haptic ? state.pressed : false,
  });

  const animationStyle = useInteractionAnimation(state);

  const handlePress = () => {
    if (isActuallyDisabled) return;
    if (onPress) onPress();
  };

  let bg = '$surface';
  let borderColor = 'transparent';
  let borderWidth = 0;
  let shadowOpacity = 0;

  switch (variant) {
    case 'flat':
      bg = '$surface';
      break;
    case 'elevated':
      bg = '$surfaceRaised';
      shadowOpacity = 0.05;
      break;
    case 'interactive':
      bg = '$surfaceRaised';
      break;
    case 'selected':
      bg = '$backgroundSecondary';
      borderColor = '$focus';
      borderWidth = 2;
      break;
    case 'outlined':
      bg = 'transparent';
      borderColor = '$divider';
      borderWidth = 1;
      break;
    case 'danger':
      bg = '$danger';
      borderColor = '$danger';
      borderWidth = 1;
      break;
    case 'success':
      bg = '$success';
      borderColor = '$success';
      borderWidth = 1;
      break;
  }

  const innerContent = (
    <View
      ref={ref as any}
      accessibilityRole={isInteractive ? 'button' : undefined}
      accessibilityState={isInteractive ? { disabled: isActuallyDisabled, busy: loading, selected: variant === 'selected' } : undefined}
      backgroundColor={bg as any}
      borderColor={borderColor as any}
      borderWidth={borderWidth}
      borderRadius="$4"
      shadowColor="$contentPrimary"
      shadowOpacity={shadowOpacity}
      shadowRadius={10}
      shadowOffset={{ width: 0, height: 4 }}
      opacity={isInteractive ? animationStyle.opacity : 1}
      scale={isInteractive ? animationStyle.scale : 1}
      cursor={isInteractive ? (isActuallyDisabled ? 'not-allowed' : 'pointer') : 'default'}
      onPress={isInteractive ? handlePress : undefined}
      onPressIn={isInteractive ? handlers.onPressIn : undefined}
      onPressOut={isInteractive ? handlers.onPressOut : undefined}
      onMouseEnter={isInteractive ? handlers.onHoverIn : undefined}
      onMouseLeave={isInteractive ? handlers.onHoverOut : undefined}
      onFocus={isInteractive ? handlers.onFocus : undefined}
      onBlur={isInteractive ? handlers.onBlur : undefined}
      {...props}
    >
      {children}
    </View>
  );

  if (isInteractive) {
    return (
      <FocusRing state={state} borderRadius="$4">
        {innerContent}
      </FocusRing>
    );
  }

  return innerContent;
});

Surface.displayName = 'Surface';
