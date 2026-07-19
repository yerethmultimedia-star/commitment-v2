import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const calmLavenderManifest: ThemeManifest = {
  id: 'CalmLavender',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.calmLavender.name',
  descriptionKey: 'appearance.themes.calmLavender.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const calmLavenderResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#F5F3FF',
    backgroundSecondary: '#ECE9FC',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    contentPrimary: '#1E1B4B',
    contentSecondary: '#6366F1',
    contentTertiary: '#8B5CF6',
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#6366F1',
    interactive: '#8B5CF6',
    focus: '#8B5CF666',
    divider: '#ECE9FC',
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
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, 'full': 9999
  },
  border: {
    width: 1,
    color: '#ECE9FC',
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

export const calmLavenderTheme: ThemeDefinition = {
  manifest: calmLavenderManifest,
  resolve: () => calmLavenderResolvedTheme
};
