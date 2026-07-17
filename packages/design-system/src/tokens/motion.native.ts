import { createAnimations } from '@tamagui/animations-react-native';
import { config as configBase } from '@tamagui/config/v3';

// Native counterpart of motion.ts — see that file's comment for why the
// stock presets and Commitment's own ones must be merged into ONE
// createAnimations() call rather than merged onto the driver object after
// the fact.
export const animations = createAnimations({
  ...(configBase.animations as any).animations,
  buttonPress: { type: 'timing' as const, duration: 120 },
  cardEntrance: { type: 'timing' as const, duration: 220 },
  pageTransition: { type: 'timing' as const, duration: 300 },
  modalTransition: { type: 'spring' as const, mass: 1, damping: 26, stiffness: 300 },
});
