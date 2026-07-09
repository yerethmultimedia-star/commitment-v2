import { ThemeRegistry, sunriseTheme, midnightTheme, forestTheme } from '@commitment/theme-engine';

export const appThemeRegistry = new ThemeRegistry();

// Register the actual themes from the theme-engine
appThemeRegistry.register(sunriseTheme);
appThemeRegistry.register(midnightTheme);
appThemeRegistry.register(forestTheme);
