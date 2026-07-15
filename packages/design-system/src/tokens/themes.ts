import { defaultLightTheme, sunriseTheme, midnightTheme, forestTheme } from '@commitment/theme-engine';
import { adaptThemeToTamagui } from '../adapters/theme-adapter';

export const themes = {
  light: adaptThemeToTamagui(defaultLightTheme.resolve()),
  dark: adaptThemeToTamagui(midnightTheme.resolve()),
  DefaultLight: adaptThemeToTamagui(defaultLightTheme.resolve()),
  Sunrise: adaptThemeToTamagui(sunriseTheme.resolve()),
  Midnight: adaptThemeToTamagui(midnightTheme.resolve()),
  Forest: adaptThemeToTamagui(forestTheme.resolve()),
};
