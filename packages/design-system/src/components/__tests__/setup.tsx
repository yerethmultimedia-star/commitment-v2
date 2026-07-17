import 'react-native-gesture-handler/jestSetup';
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));



import React from 'react';
import { render, RenderResult } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import { config } from '../../tamagui.config.js';

// Real registry keys (packages/design-system/src/tokens/themes.ts) are
// capitalized — `Sunrise`/`Midnight`/`Forest`/`DefaultLight`. This map lets
// every existing call site keep its lowercase, readable theme name while
// actually resolving to a theme Tamagui recognizes. Previously this
// function passed the lowercase name straight to `defaultTheme`, which
// matched nothing — Tamagui silently fell back to its first-registered
// theme (`light` → this app's `DefaultLight`) regardless of which name was
// requested, so every "sunrise"/"midnight"/"forest" snapshot test was
// actually asserting DefaultLight's output (see TD-014).
const THEME_NAME: Record<string, string> = {
  sunrise: 'Sunrise',
  midnight: 'Midnight',
  forest: 'Forest',
  defaultLight: 'DefaultLight',
};

export const renderWithTheme = async (ui: React.ReactElement, theme: 'sunrise' | 'midnight' | 'forest' | 'defaultLight' = 'sunrise'): Promise<RenderResult> => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TamaguiProvider config={config} defaultTheme={THEME_NAME[theme] as any}>
      {children}
    </TamaguiProvider>
  );
  const result = await render(ui, { wrapper: Wrapper });
  return result;
};
