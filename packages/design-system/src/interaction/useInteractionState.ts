import { useState, useMemo } from 'react';
import { InteractionState, InteractionStateHandlers } from './InteractionState.js';

interface UseInteractionStateOptions {
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  selected?: boolean;
}

export const useInteractionState = (options?: UseInteractionStateOptions) => {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const state: InteractionState = useMemo(() => ({
    pressed: pressed && !options?.disabled && !options?.loading,
    hovered: hovered && !options?.disabled && !options?.loading,
    focused,
    loading: !!options?.loading,
    disabled: !!options?.disabled,
    error: !!options?.error,
    success: !!options?.success,
    selected: !!options?.selected,
  }), [pressed, hovered, focused, options]);

  const handlers: InteractionStateHandlers = useMemo(() => ({
    onPressIn: () => setPressed(true),
    onPressOut: () => setPressed(false),
    onHoverIn: () => setHovered(true),
    onHoverOut: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }), []);

  return { state, handlers };
};
