import 'react-native-gesture-handler/jestSetup';
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));



import React from 'react';
import { render, RenderResult } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import { config } from '../../tamagui.config.js';

export const renderWithTheme = async (ui: React.ReactElement, theme: 'sunrise' | 'midnight' | 'forest' = 'sunrise'): Promise<RenderResult> => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TamaguiProvider config={config} defaultTheme={theme}>
      {children}
    </TamaguiProvider>
  );
  const result = await render(ui, { wrapper: Wrapper });
  return result;
};
