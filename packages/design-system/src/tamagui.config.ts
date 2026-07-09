import { createTamagui, TamaguiInternalConfig } from '@tamagui/core';
import { config as configBase } from '@tamagui/config/v3';
import { themes } from './tokens/themes.js';
import { interFont } from './tokens/typography.js';
import { space, size } from './tokens/space.js';

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
}) as any;

export type AppConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}
