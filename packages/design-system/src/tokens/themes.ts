import { sunriseTheme, midnightTheme, forestTheme } from '@commitment/theme-engine';
import { adaptThemeToTamagui } from '../adapters/theme-adapter.js';

export const themes = {
  light: adaptThemeToTamagui(sunriseTheme.resolve()),
  dark: adaptThemeToTamagui(midnightTheme.resolve()),
  Sunrise: adaptThemeToTamagui(sunriseTheme.resolve()),
  Midnight: adaptThemeToTamagui(midnightTheme.resolve()),
  Forest: adaptThemeToTamagui(forestTheme.resolve()),
};
