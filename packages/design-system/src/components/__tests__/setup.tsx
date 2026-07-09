// @ts-nocheck
import React from 'react';
import { render, RenderResult } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config.ts';

export const renderWithTheme = (ui: React.ReactElement, theme: 'sunrise' | 'midnight' | 'forest' = 'sunrise'): RenderResult => {
  return render(
    <TamaguiProvider config={config} defaultTheme={theme}>
      {ui}
    </TamaguiProvider>
  );
};
