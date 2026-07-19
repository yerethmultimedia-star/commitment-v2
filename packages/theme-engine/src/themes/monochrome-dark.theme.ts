import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const monochromeDarkManifest: ThemeManifest = {
  id: 'MonochromeDark',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.monochromeDark.name',
  descriptionKey: 'appearance.themes.monochromeDark.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const monochromeDarkResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#09090B',
    backgroundSecondary: '#18181B',
    surface: '#09090B',
    surfaceRaised: '#18181B',
    contentPrimary: '#FAFAFA',
    contentSecondary: '#A1A1AA',
    contentTertiary: '#71717A',
    accent: '#FAFAFA',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#FAFAFA',
    interactive: '#FAFAFA',
    focus: '#FAFAFA66',
    divider: '#27272A',
    contentOnAccent: '#09090B',
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
    '0': 0, '1': 6, '2': 8, '3': 12, '4': 16, 'full': 9999
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

export const monochromeDarkTheme: ThemeDefinition = {
  manifest: monochromeDarkManifest,
  resolve: () => monochromeDarkResolvedTheme
};
