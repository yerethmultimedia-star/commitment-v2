import { createAnimations } from '@tamagui/animations-css';
import { config as configBase } from '@tamagui/config/v3';

// Commitment's own named animation presets (COMMITMENT_EXPERIENCE_GUIDE.md
// §5) merged with Tamagui's stock web presets, both fed into ONE
// createAnimations() call. This matters: createAnimations()'s returned
// `useAnimations` hook is a closure bound to whatever map is passed in at
// call time — spreading/overwriting the *returned* driver's `.animations`
// data property afterward does NOT change what that closure actually looks
// values up in. Merging first, then calling createAnimations() once, is the
// only way a new preset name is actually found at runtime (confirmed via an
// isolated repro after the first attempt silently no-op'd — see
// TECH_DEBT.md RI-11).
const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
const easeInOut = 'cubic-bezier(0.42, 0, 0.58, 1)';

export const animations = createAnimations({
  ...(configBase.animations as any).animations,
  buttonPress: `120ms ${easeOut}`,
  cardEntrance: `220ms ${easeOut}`,
  pageTransition: `300ms ${easeInOut}`,
  // True spring physics don't exist in CSS transitions — approximated here
  // with a duration matching the settle time of the native spring config
  // (mass: 1, damping: 26, stiffness: 300, see motion.native.ts) and the
  // same gentle, minimal-overshoot ease-out curve used elsewhere.
  modalTransition: `350ms ${easeOut}`,
});
