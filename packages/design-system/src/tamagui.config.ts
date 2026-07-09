import { createTamagui, TamaguiInternalConfig } from '@tamagui/core';
import { config as configBase } from '@tamagui/config/v3';

export const config: TamaguiInternalConfig = createTamagui(configBase) as any;

export type AppConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}
