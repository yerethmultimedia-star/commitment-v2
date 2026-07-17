import React, { useRef } from 'react';
import { View, Spinner } from 'tamagui';
import { useTranslation } from '@commitment/localization';
import { Label } from './typography/Label.js';
import { useInteractionState, useHapticBehavior, FocusRing, useInteractionAnimation } from '../interaction/index.js';
import { toPlatformAccessibilityProps } from '../accessibility/platformAccessibilityProps.js';

export interface ButtonProps {
  /**
   * The i18n key for the button text.
   */
  i18nKey: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  tone?: 'normal' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  fullWidth?: boolean;
  destructive?: boolean; // Alias for tone="error"
  loadingTextI18nKey?: string;
  confirmHaptic?: boolean;
  preventDoublePress?: boolean;
  testID?: string;
  analyticsId?: string;
  'aria-describedby'?: string;
  onPress?: () => void;
}

export const Button = React.forwardRef<any, ButtonProps>(({
  i18nKey,
  variant = 'primary',
  tone = 'normal',
  size = 'medium',
  loading = false,
  disabled = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  destructive = false,
  loadingTextI18nKey,
  preventDoublePress = true,
  testID,
  analyticsId,
  'aria-describedby': ariaDescribedBy,
  onPress,
}, ref) => {
  const { t } = useTranslation();
  const actualTone = destructive ? 'error' : tone;
  const isActuallyDisabled = disabled || loading;

  const { state, handlers } = useInteractionState({
    disabled: isActuallyDisabled,
    loading,
    success: actualTone === 'success',
    error: actualTone === 'error',
  });

  useHapticBehavior(state);
  const animationStyle = useInteractionAnimation(state);

  const isPressing = useRef(false);

  const handlePress = () => {
    if (isActuallyDisabled) return;
    if (preventDoublePress && isPressing.current) return;

    if (preventDoublePress) {
      isPressing.current = true;
      setTimeout(() => {
        isPressing.current = false;
      }, 500); // 500ms throttle for double press prevention
    }

    if (onPress) onPress();
  };

  // Resolve styling based on variant & tone
  let bg = '$interactive';
  let textColor = '$contentPrimary';
  let borderColor = 'transparent';

  if (variant === 'primary') {
    const isSemanticTone = actualTone === 'error' || actualTone === 'success';
    bg = actualTone === 'error' ? '$danger' : actualTone === 'success' ? '$success' : '$interactive';
    // contentOnAccent/contentOnSemantic are picked per theme so this always
    // clears WCAG AA — some themes' accent is too light for white text.
    textColor = isSemanticTone ? '$contentOnSemantic' : '$contentOnAccent';
  } else if (variant === 'secondary') {
    bg = '$surfaceRaised';
    textColor = actualTone === 'error' ? '$danger' : '$contentPrimary';
  } else if (variant === 'outline') {
    bg = 'transparent';
    borderColor = actualTone === 'error' ? '$danger' : '$divider';
    textColor = actualTone === 'error' ? '$danger' : '$contentPrimary';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = actualTone === 'error' ? '$danger' : '$contentPrimary';
  }

  // Handle pressed state overrides
  if (state.pressed && variant !== 'ghost') {
    // Dim slightly or use a predefined press color
  }

  const height = size === 'small' ? 32 : size === 'large' ? 56 : 48;
  const px = size === 'small' ? '$3' : size === 'large' ? '$5' : '$4';
  const fontSize = size === 'small' ? '$3' : size === 'large' ? '$5' : '$4';

  return (
    <FocusRing state={state} borderRadius="$4">
      <View
        ref={ref as any}
        testID={testID}
        accessible={true}
        {...toPlatformAccessibilityProps({
          accessibilityRole: 'button',
          accessibilityState: { disabled: isActuallyDisabled, busy: loading },
          accessibilityLabel: t(i18nKey),
        })}
        aria-describedby={ariaDescribedBy}
        height={height}
        paddingHorizontal={px}
        backgroundColor={bg as any}
        borderColor={borderColor as any}
        borderWidth={variant === 'outline' ? 1 : 0}
        borderRadius="$4"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        width={fullWidth ? '100%' : undefined}
        opacity={animationStyle.opacity}
        scale={animationStyle.scale}
        transition={animationStyle.transition}
        cursor={isActuallyDisabled ? 'not-allowed' : 'pointer'}
        // Interaction Handlers
        onPress={handlePress}
        onPressIn={handlers.onPressIn}
        onPressOut={handlers.onPressOut}
        onMouseEnter={handlers.onHoverIn}
        onMouseLeave={handlers.onHoverOut}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        {...({'data-analytics-id': analyticsId} as any)}
      >
        {loading ? (
          <View flexDirection="row" alignItems="center" gap="$2">
            <Spinner color={textColor as any} />
            {loadingTextI18nKey && (
              <Label 
                i18nKey={loadingTextI18nKey} 
                color={textColor as any} 
                fontSize={fontSize} 
                fontWeight="600" 
              />
            )}
          </View>
        ) : (
          <View flexDirection="row" alignItems="center" gap="$2">
            {iconStart}
            <Label 
              i18nKey={i18nKey} 
              color={textColor as any} 
              fontSize={fontSize} 
              fontWeight="600" 
            />
            {iconEnd}
          </View>
        )}
      </View>
    </FocusRing>
  );
});

Button.displayName = 'Button';
