import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const cosmicCalmManifest: ThemeManifest = {
  id: 'CosmicCalm',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.cosmicCalm.name',
  descriptionKey: 'appearance.themes.cosmicCalm.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const cosmicCalmResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#0F0F12',
    backgroundSecondary: '#1A1A22',
    surface: '#1E1F26',
    surfaceRaised: '#282932',
    contentPrimary: '#FFFFFF',
    contentSecondary: '#9CA3AF',
    contentTertiary: '#6B7280',
    accent: '#C084FC',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#6366F1',
    interactive: '#C084FC',
    focus: '#C084FC66',
    divider: '#1A1A22',
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
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, 'full': 9999
  },
  border: {
    width: 1,
    color: '#1A1A22',
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

export const cosmicCalmTheme: ThemeDefinition = {
  manifest: cosmicCalmManifest,
  resolve: () => cosmicCalmResolvedTheme
};
