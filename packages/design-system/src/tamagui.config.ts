import { createTamagui, TamaguiInternalConfig } from '@tamagui/core';
import { config as configBase } from '@tamagui/config/v3';
import { themes } from './tokens/themes';
import { interFont } from './tokens/typography';
import { space, size } from './tokens/space';
import { animations as motionAnimationDriver } from './tokens/motion';

export const config: TamaguiInternalConfig = createTamagui({
  ...configBase,
  themes: {
    ...configBase.themes,
    ...themes,
  },
  fonts: {
    ...configBase.fonts,
    body: interFont,
    heading: interFont,
  },
  tokens: {
    ...configBase.tokens,
    space: {
      ...configBase.tokens.space,
      ...space,
    },
    size: {
      ...configBase.tokens.size,
      ...size,
    },
  },
  // Commitment's own named presets (COMMITMENT_EXPERIENCE_GUIDE.md §5)
  // merged with Tamagui's stock quick/lazy/bouncy/etc. — built as ONE
  // complete driver in ./tokens/motion.ts (web) / motion.native.ts, not
  // assembled here, because createAnimations()'s useAnimations hook closes
  // over whatever map it's given at creation time; merging onto the
  // *returned* driver object afterward doesn't reach that closure.
  animations: motionAnimationDriver as any,
}) as any;

export type AppConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}
