import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

// "Medianoche" — the deliberate dark theme redesign the VS-031 theme
// consolidation deferred (this file previously shipped a placeholder
// "Legacy Dark" palette while Default Light became the premium direction).
// The 'Midnight' id is kept unchanged so existing persisted selections and
// prior test coverage keep resolving correctly; only the palette and the
// display name/description (now pointing at the real 'midnight' i18n keys
// instead of 'legacyDark') changed.
export const midnightManifest: ThemeManifest = {
  id: 'Midnight',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.midnight.name',
  descriptionKey: 'appearance.themes.midnight.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const midnightResolvedTheme: ResolvedTheme = {
  colors: {
    // Near-black neutral, not pure OLED black — mirrors Default Light's
    // "not pure white" treatment so cards still read as elevated.
    background: '#09090B',
    backgroundSecondary: '#27272A',

    // Surfaces
    surface: '#18181B',
    surfaceRaised: '#18181B',

    // Content colors (light on dark)
    contentPrimary: '#FAFAFA',
    contentSecondary: '#A1A1AA',
    contentTertiary: '#A1A1AA',

    // Accent (violet, echoing Default Light's accent hue in a dark register)
    accent: '#8B5CF6',

    // Semantic
    success: '#22C55E',
    warning: '#F5A623',
    danger: '#FF6B5E',
    info: '#8B5CF6',

    // Interactive states
    interactive: '#8B5CF6',
    focus: '#8B5CF666',

    // Borders
    divider: '#27272A',

    // Text-on-color pairs, verified against WCAG AA (see ResolvedTheme.ts).
    // White-on-accent fails just under threshold (4.23:1) — the page's own
    // near-black background passes at 4.70:1, matching the "cutout" look the
    // previous Midnight palette also used. Light-on-semantic (this theme's
    // own contentPrimary) fails badly against the medium-bright semantic
    // colors (2.18-2.68:1) — semantic surfaces need dark text regardless of
    // overall theme darkness, so this uses the same universal near-black the
    // other three themes use, not contentPrimary.
    contentOnAccent: '#09090B',
    contentOnSemantic: '#18181A',
  },
  typography: {
    fontFamily: 'Inter',
    fontFamilyBold: 'Inter-Bold',
  },
  spacing: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64
  },
  radius: {
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, full: 9999
  },
  border: {
    width: 1,
    color: '#27272A',
  },
  elevation: {
    '0': 'none',
    '1': 'xs',
    '2': 'sm',
  },
  motion: {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: null,
    pageTransition: null,
    modalTransition: null,
    buttonPress: null,
    cardEntrance: null,
    listAnimation: null
  },
  icons: {
    style: 'outline'
  },
  illustrations: {
    style: 'flat'
  },
  opacity: {
    disabled: 0.4,
    hover: 0.85,
    press: 0.7
  },
  zIndex: {
    base: 0,
    modal: 100,
    popover: 200,
    tooltip: 300
  }
};

export const midnightTheme: ThemeDefinition = {
  manifest: midnightManifest,
  resolve: () => midnightResolvedTheme
};
