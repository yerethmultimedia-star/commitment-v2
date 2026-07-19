import { useTheme } from 'tamagui';
import { InteractionState } from './InteractionState.js';

export const useInteractionAnimation = (state: InteractionState) => {
  const theme = useTheme();
  // Theme-driven — ResolvedTheme.opacity (disabled/hover/press), injected by
  // adaptThemeToTamagui() (see theme-adapter.ts). Fallbacks only cover a
  // theme that somehow fails to resolve these; they intentionally match the
  // values every shipped theme already declares, so a resolution failure
  // degrades to today's behavior rather than a visibly different one.
  const disabledOpacity = theme.opacityDisabled?.get?.() ?? 0.4;
  const hoverOpacity = theme.opacityHover?.get?.() ?? 0.85;
  const pressOpacity = theme.opacityPress?.get?.() ?? 0.7;

  // Common scale effect for pressing
  const scale = state.pressed ? 0.95 : 1;
  // Opacity precedence: disabled overrides everything; pressed (a stronger,
  // momentary signal) overrides hover; hover is the resting-interactive dim.
  const opacity = state.disabled
    ? disabledOpacity
    : state.pressed
      ? pressOpacity
      : state.hovered
        ? hoverOpacity
        : 1;

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
