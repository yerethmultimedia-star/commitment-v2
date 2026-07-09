import { InteractionState } from './InteractionState.js';

export const useInteractionAnimation = (state: InteractionState) => {
  // Common scale effect for pressing
  const scale = state.pressed ? 0.95 : 1;
  // Common opacity effect for hover/disable
  const opacity = state.disabled ? 0.5 : state.hovered ? 0.8 : 1;
  
  return {
    scale,
    opacity,
    animation: 'fast',
  };
};
