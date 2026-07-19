import { defaultLightTheme, sunriseTheme, midnightTheme, forestTheme, electricVibrancyTheme, neonFocusTheme, freshEnergyTheme, midnightForestTheme, calmLavenderTheme, cosmicCalmTheme, monochromeLightTheme, monochromeDarkTheme, tenderRoseTheme, mintFreshnessTheme, lavenderMistTheme, shadowSentinelTheme, arachnidEnergyTheme, fierySpiritTheme, royalPrideTheme } from '@commitment/theme-engine';
import { adaptThemeToTamagui } from '../adapters/theme-adapter';

export const themes = {
  light: adaptThemeToTamagui(defaultLightTheme.resolve()),
  dark: adaptThemeToTamagui(midnightTheme.resolve()),
  DefaultLight: adaptThemeToTamagui(defaultLightTheme.resolve()),
  Sunrise: adaptThemeToTamagui(sunriseTheme.resolve()),
  Midnight: adaptThemeToTamagui(midnightTheme.resolve()),
  Forest: adaptThemeToTamagui(forestTheme.resolve()),
  ElectricVibrancy: adaptThemeToTamagui(electricVibrancyTheme.resolve()),
  NeonFocus: adaptThemeToTamagui(neonFocusTheme.resolve()),
  FreshEnergy: adaptThemeToTamagui(freshEnergyTheme.resolve()),
  MidnightForest: adaptThemeToTamagui(midnightForestTheme.resolve()),
  CalmLavender: adaptThemeToTamagui(calmLavenderTheme.resolve()),
  CosmicCalm: adaptThemeToTamagui(cosmicCalmTheme.resolve()),
  MonochromeLight: adaptThemeToTamagui(monochromeLightTheme.resolve()),
  MonochromeDark: adaptThemeToTamagui(monochromeDarkTheme.resolve()),
  TenderRose: adaptThemeToTamagui(tenderRoseTheme.resolve()),
  MintFreshness: adaptThemeToTamagui(mintFreshnessTheme.resolve()),
  LavenderMist: adaptThemeToTamagui(lavenderMistTheme.resolve()),
  ShadowSentinel: adaptThemeToTamagui(shadowSentinelTheme.resolve()),
  ArachnidEnergy: adaptThemeToTamagui(arachnidEnergyTheme.resolve()),
  FierySpirit: adaptThemeToTamagui(fierySpiritTheme.resolve()),
  RoyalPride: adaptThemeToTamagui(royalPrideTheme.resolve()),
};
