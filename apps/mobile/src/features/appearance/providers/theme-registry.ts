import { ThemeRegistry, defaultLightTheme, sunriseTheme, midnightTheme, forestTheme, electricVibrancyTheme, neonFocusTheme, freshEnergyTheme, midnightForestTheme, calmLavenderTheme, cosmicCalmTheme, monochromeLightTheme, monochromeDarkTheme, tenderRoseTheme, mintFreshnessTheme, lavenderMistTheme, shadowSentinelTheme, arachnidEnergyTheme, fierySpiritTheme, royalPrideTheme } from '@commitment/theme-engine';

export const appThemeRegistry = new ThemeRegistry();

// Register the actual themes from the theme-engine. Order here also drives
// the Appearance screen's theme picker order — Default Light first since
// it's the new default.
appThemeRegistry.register(defaultLightTheme);
appThemeRegistry.register(sunriseTheme);
appThemeRegistry.register(midnightTheme);
appThemeRegistry.register(forestTheme);
appThemeRegistry.register(electricVibrancyTheme);
appThemeRegistry.register(neonFocusTheme);
appThemeRegistry.register(freshEnergyTheme);
appThemeRegistry.register(midnightForestTheme);
appThemeRegistry.register(calmLavenderTheme);
appThemeRegistry.register(cosmicCalmTheme);
appThemeRegistry.register(monochromeLightTheme);
appThemeRegistry.register(monochromeDarkTheme);
appThemeRegistry.register(tenderRoseTheme);
appThemeRegistry.register(mintFreshnessTheme);
appThemeRegistry.register(lavenderMistTheme);
appThemeRegistry.register(shadowSentinelTheme);
appThemeRegistry.register(arachnidEnergyTheme);
appThemeRegistry.register(fierySpiritTheme);
appThemeRegistry.register(royalPrideTheme);
