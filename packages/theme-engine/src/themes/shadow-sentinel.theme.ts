import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const shadowSentinelManifest: ThemeManifest = {
  id: 'ShadowSentinel',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.shadowSentinel.name',
  descriptionKey: 'appearance.themes.shadowSentinel.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const shadowSentinelResolvedTheme: ResolvedTheme = {
  colors: {
    // Pitch-black night background
    background: '#0A0A0A',
    backgroundSecondary: '#141414', // dark graphite

    // Sleek armor-plate surfaces
    surface: '#1F1F1F',
    surfaceRaised: '#282828',

    // Content colors
    contentPrimary: '#E5E5E5', // light titanium gray
    contentSecondary: '#A0A0A0', // medium gray
    contentTertiary: '#666666',

    // Batman Alert Yellow / Gold Accent
    accent: '#F2C94C',

    // Semantic
    success: '#27AE60',
    warning: '#F2C94C',
    danger: '#EB5757',
    info: '#29B6F6',

    // Interactive
    interactive: '#F2C94C',
    focus: '#F2C94C66',

    // Borders
    divider: '#141414',

    // High contrast black text on bright yellow accent
    contentOnAccent: '#000000',
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
    // Sharp, tactical, geometric armor-like shapes
    '0': 0, '1': 4, '2': 6, '3': 8, '4': 12, 'full': 9999
  },
  border: {
    width: 1,
    color: '#141414',
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

export const shadowSentinelTheme: ThemeDefinition = {
  manifest: shadowSentinelManifest,
  resolve: () => shadowSentinelResolvedTheme
};
