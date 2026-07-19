import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const electricVibrancyManifest: ThemeManifest = {
  id: 'ElectricVibrancy',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.electricVibrancy.name',
  descriptionKey: 'appearance.themes.electricVibrancy.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const electricVibrancyResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#FFFFFF',
    backgroundSecondary: '#F4F4F5',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    contentPrimary: '#111827',
    contentSecondary: '#71717A',
    contentTertiary: '#A1A1AA',
    accent: '#006FEE',
    success: '#17C964',
    warning: '#F5A524',
    danger: '#F31260',
    info: '#006FEE',
    interactive: '#006FEE',
    focus: '#006FEE66',
    divider: '#E4E4E7',
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
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 24, 'full': 9999
  },
  border: {
    width: 1,
    color: '#E4E4E7',
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

export const electricVibrancyTheme: ThemeDefinition = {
  manifest: electricVibrancyManifest,
  resolve: () => electricVibrancyResolvedTheme
};
