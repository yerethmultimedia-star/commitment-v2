import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const lavenderMistManifest: ThemeManifest = {
  id: 'LavenderMist',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.lavenderMist.name',
  descriptionKey: 'appearance.themes.lavenderMist.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const lavenderMistResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#F9F5FF',
    backgroundSecondary: '#F4EBFF',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    contentPrimary: '#2D1A47',
    contentSecondary: '#6B46C1',
    contentTertiary: '#9F7AEA',
    accent: '#9F7AEA',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#9F7AEA',
    interactive: '#9F7AEA',
    focus: '#9F7AEA66',
    divider: '#F4EBFF',
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
    '0': 0, '1': 10, '2': 14, '3': 18, '4': 24, 'full': 9999
  },
  border: {
    width: 1,
    color: '#F4EBFF',
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

export const lavenderMistTheme: ThemeDefinition = {
  manifest: lavenderMistManifest,
  resolve: () => lavenderMistResolvedTheme
};
