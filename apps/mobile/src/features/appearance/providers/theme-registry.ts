import { ThemeRegistry, defaultLightTheme, sunriseTheme, midnightTheme, forestTheme } from '@commitment/theme-engine';

export const appThemeRegistry = new ThemeRegistry();

// Register the actual themes from the theme-engine. Order here also drives
// the Appearance screen's theme picker order — Default Light first since
// it's the new default.
appThemeRegistry.register(defaultLightTheme);
appThemeRegistry.register(sunriseTheme);
appThemeRegistry.register(midnightTheme);
appThemeRegistry.register(forestTheme);
