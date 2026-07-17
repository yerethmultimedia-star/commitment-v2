import { InteractionState } from './InteractionState.js';

export const useInteractionAnimation = (state: InteractionState) => {
  // Common scale effect for pressing
  const scale = state.pressed ? 0.95 : 1;
  // Common opacity effect for hover/disable
  const opacity = state.disabled ? 0.5 : state.hovered ? 0.8 : 1;

  return {
    scale,
    opacity,
    // Named prop is `transition`, not `animation` — @tamagui/web 2.4.2 gates
    // its entire animation runtime on `'transition' in props`
    // (useComponentState.ts's hasAnimationProp); an `animation` prop is
    // accepted by some type signatures but never activates anything. This
    // silently no-op'd on every Button/Card/Switch/IconButton/Surface press
    // since this hook was written — confirmed via an isolated repro (see
    // TECH_DEBT.md RI-11) before renaming. 'buttonPress' is a real preset
    // (see tamagui.config.ts / tokens/motion.ts, COMMITMENT_EXPERIENCE_GUIDE.md §5).
    transition: 'buttonPress',
  };
};
