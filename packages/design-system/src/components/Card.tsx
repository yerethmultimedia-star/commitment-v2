import React from 'react';
import { View, YStackProps } from 'tamagui';
import { useInteractionState, useHapticBehavior, FocusRing, useInteractionAnimation } from '../interaction/index.js';

export interface CardProps extends YStackProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  selectable?: boolean;
  selected?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  focusable?: boolean;
  testID?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<any, CardProps>(({
  variant = 'elevated',
  selectable = false,
  selected = false,
  clickable = false,
  disabled = false,
  loading = false,
  focusable = true,
  testID,
  onPress,
  children,
  ...props
}, ref) => {
  const isInteractive = clickable || selectable;
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    selected,
  });

  useHapticBehavior(state);
  const animationStyle = useInteractionAnimation(state);

  const handlePress = () => {
    if (isActuallyDisabled) return;
    if (onPress) onPress();
  };

  // Determine styling based on variant and state
  let bg = '$surfaceRaised';
  let borderColor = '$divider';
  let borderWidth = 0;
  let shadowOpacity = 0;

  if (variant === 'elevated') {
    bg = '$surfaceRaised';
    shadowOpacity = 0.05;
    borderWidth = 1;
    borderColor = 'transparent';
  } else if (variant === 'outlined') {
    bg = 'transparent';
    borderWidth = 1;
    borderColor = '$divider';
  } else if (variant === 'flat') {
    bg = '$surface';
  }

  // Selected state override
  if (selectable && selected) {
    borderColor = '$focus';
    borderWidth = 2;
    bg = '$backgroundSecondary';
  }

  const innerContent = (
    <View
      ref={ref as any}
      testID={testID}
      accessibilityRole={isInteractive ? 'button' : undefined}
      accessibilityState={isInteractive ? { disabled: isActuallyDisabled, selected, busy: loading } : undefined}
      backgroundColor={bg as any}
      borderColor={borderColor as any}
      borderWidth={borderWidth}
      borderRadius="$4"
      padding="$4"
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
      onFocus={isInteractive && focusable ? handlers.onFocus : undefined}
      onBlur={isInteractive && focusable ? handlers.onBlur : undefined}
      {...props}
    >
      {children}
    </View>
  );

  if (isInteractive && focusable) {
    return (
      <FocusRing state={state} borderRadius="$4">
        {innerContent}
      </FocusRing>
    );
  }

  return innerContent;
});

Card.displayName = 'Card';
