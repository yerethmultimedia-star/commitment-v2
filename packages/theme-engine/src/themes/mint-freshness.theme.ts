import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const mintFreshnessManifest: ThemeManifest = {
  id: 'MintFreshness',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.mintFreshness.name',
  descriptionKey: 'appearance.themes.mintFreshness.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const mintFreshnessResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#F0FDF4',
    backgroundSecondary: '#D1FAE5',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    contentPrimary: '#064E3B',
    contentSecondary: '#374151',
    contentTertiary: '#6B7280',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#10B981',
    interactive: '#10B981',
    focus: '#10B98166',
    divider: '#D1FAE5',
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
    color: '#D1FAE5',
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

export const mintFreshnessTheme: ThemeDefinition = {
  manifest: mintFreshnessManifest,
  resolve: () => mintFreshnessResolvedTheme
};
