import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const sunriseManifest: ThemeManifest = {
  id: 'Sunrise',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.sunrise.name',
  descriptionKey: 'appearance.themes.sunrise.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const sunriseResolvedTheme: ResolvedTheme = {
  colors: {
    // Warm ivory background — "Amanecer" redesign
    background: '#FFFDF5',
    backgroundSecondary: '#EBE4D5',

    // Surfaces remain light but distinct from background
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',

    // Content colors
    contentPrimary: '#271F15',
    contentSecondary: '#786E5D',
    contentTertiary: '#786E5D',

    // Accents (Amber)
    accent: '#F59E0B',

    // Semantic
    success: '#22C55E',
    warning: '#F5A623',
    danger: '#FF6B5E',
    info: '#F59E0B',

    // Interactive states
    interactive: '#F59E0B',
    focus: '#F59E0B66',

    // Borders
    divider: '#EBE4D5',

    // Text-on-color pairs, verified against WCAG AA (see ResolvedTheme.ts).
    // Amber accent is light enough that white text fails contrast (2.15:1) —
    // dark text passes at 7.56:1.
    contentOnAccent: '#271F15',
    contentOnSemantic: '#271F15',
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
    color: '#EBE4D5',
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

export const sunriseTheme: ThemeDefinition = {
  manifest: sunriseManifest,
  resolve: () => sunriseResolvedTheme
};
