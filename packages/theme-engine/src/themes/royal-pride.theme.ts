import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const royalPrideManifest: ThemeManifest = {
  id: 'RoyalPride',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.royalPride.name',
  descriptionKey: 'appearance.themes.royalPride.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const royalPrideResolvedTheme: ResolvedTheme = {
  colors: {
    // Vegeta deep royal navy bodysuit background
    background: '#0E1626',
    backgroundSecondary: '#1B2436',

    // Slate navy surfaces
    surface: '#1B2436',
    surfaceRaised: '#242F46',

    // Content colors (Armor White text)
    contentPrimary: '#E2E8F0',
    contentSecondary: '#94A3B8',
    contentTertiary: '#475569',

    // Vegeta Royal Blue Accent
    accent: '#3F8EFC',

    // Semantic
    success: '#10B981',
    warning: '#F2C94C', // Vegeta Armor Gold/Yellow
    danger: '#EF4444',
    info: '#3F8EFC',

    // Interactive
    interactive: '#3F8EFC',
    focus: '#3F8EFC66',

    // Borders
    divider: '#2B3852',

    // White text on accent
    contentOnAccent: '#FFFFFF',
    contentOnSemantic: '#FFFFFF',
  },
  typography: {
    fontFamily: 'Inter',
    fontFamilyBold: 'Inter-Bold',
  },
  spacing: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64
  },
  radius: {
    // Rigid, structured, sharp armor shapes (representing discipline and pride)
    '0': 0, '1': 4, '2': 6, '3': 8, '4': 12, 'full': 9999
  },
  border: {
    width: 1,
    color: '#2B3852',
  },
  elevation: {
    '0': 'none',
    '1': 'xs',
    '2': 'sm',
  },
  motion: {
    fast: 120,
    normal: 220,
    slow: 300,
    spring: { mass: 1, damping: 26, stiffness: 300 },
    pageTransition: 300,
    modalTransition: { mass: 1, damping: 26, stiffness: 300 },
    buttonPress: 120,
    cardEntrance: 220,
    listAnimation: 40
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

export const royalPrideTheme: ThemeDefinition = {
  manifest: royalPrideManifest,
  resolve: () => royalPrideResolvedTheme
};
