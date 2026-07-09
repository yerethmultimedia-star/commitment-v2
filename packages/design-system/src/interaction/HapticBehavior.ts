import { useEffect, useRef } from 'react';
import { useHaptic } from '../hooks/useHaptic.js';
import { InteractionState } from './InteractionState.js';

/**
 * Declaratively maps changes in InteractionState to the Haptic engine.
 * Ensures haptics are triggered on specific state transitions.
 */
export const useHapticBehavior = (state: InteractionState) => {
  const haptic = useHaptic();
  
  const prevPressed = useRef(state.pressed);
  const prevSuccess = useRef(state.success);
  const prevError = useRef(state.error);
  const prevSelected = useRef(state.selected);

  useEffect(() => {
    if (state.pressed && !prevPressed.current) {
      haptic.impact('light');
    }
    prevPressed.current = state.pressed;
  }, [state.pressed, haptic]);

  useEffect(() => {
    if (state.success && !prevSuccess.current) {
      haptic.success();
    }
    prevSuccess.current = state.success;
  }, [state.success, haptic]);

  useEffect(() => {
    if (state.error && !prevError.current) {
      haptic.error();
    }
    prevError.current = state.error;
  }, [state.error, haptic]);

  useEffect(() => {
    if (state.selected && !prevSelected.current) {
      haptic.selection();
    }
    prevSelected.current = state.selected;
  }, [state.selected, haptic]);
};
