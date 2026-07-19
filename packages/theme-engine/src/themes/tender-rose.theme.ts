import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const tenderRoseManifest: ThemeManifest = {
  id: 'TenderRose',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.tenderRose.name',
  descriptionKey: 'appearance.themes.tenderRose.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const tenderRoseResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#FFF0F5',
    backgroundSecondary: '#FFE4E1',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    contentPrimary: '#4A2E35',
    contentSecondary: '#A78086',
    contentTertiary: '#C9A9AE',
    accent: '#FF69B4',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#FF69B4',
    interactive: '#FF69B4',
    focus: '#FF69B466',
    divider: '#FFE4E1',
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
    color: '#FFE4E1',
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

export const tenderRoseTheme: ThemeDefinition = {
  manifest: tenderRoseManifest,
  resolve: () => tenderRoseResolvedTheme
};
