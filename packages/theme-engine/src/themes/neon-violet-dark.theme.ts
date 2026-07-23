import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const neonVioletDarkManifest: ThemeManifest = {
  id: 'NeonVioletDark',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.neonVioletDark.name',
  descriptionKey: 'appearance.themes.neonVioletDark.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const neonVioletDarkResolvedTheme: ResolvedTheme = {
  colors: {
    // Dark Tactical Violet Canvas (Deep purple/black background)
    background: '#0F0A1C',
    backgroundSecondary: '#19102E',

    // Card and surface layers
    surface: '#1E1538',
    surfaceRaised: '#291D4C',

    // Content colors
    contentPrimary: '#F3F4F6',
    contentSecondary: '#A78BFA',
    contentTertiary: '#7C3AED',

    // Hyper-Vibrant Neon Green Accent
    accent: '#4ADE80',

    // Semantic colors (Hyper-vibrant Neon Green success, Warning Orange)
    success: '#39FF14',
    warning: '#FF6B00',
    danger: '#EF4444',
    info: '#C084FC',

    // Interactive elements (Luminous Neon Green)
    interactive: '#4ADE80',
    focus: '#4ADE8066',

    // Borders & dividers
    divider: '#2E1C52',

    // Text contrast on accent & semantic layers
    contentOnAccent: '#0F0A1C',
    contentOnSemantic: '#0F0A1C',
  },
  typography: {
    fontFamily: 'Inter',
    fontFamilyBold: 'Inter-Bold',
  },
  spacing: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64
  },
  radius: {
    '0': 0, '1': 6, '2': 10, '3': 14, '4': 18, 'full': 9999
  },
  border: {
    width: 1,
    color: '#2E1C52',
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

export const neonVioletDarkTheme: ThemeDefinition = {
  manifest: neonVioletDarkManifest,
  resolve: () => neonVioletDarkResolvedTheme
};
