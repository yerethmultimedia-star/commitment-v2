import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const neonVioletLightManifest: ThemeManifest = {
  id: 'NeonVioletLight',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.neonVioletLight.name',
  descriptionKey: 'appearance.themes.neonVioletLight.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const neonVioletLightResolvedTheme: ResolvedTheme = {
  colors: {
    // Light Canvas (Refined violet/slate tinted light background)
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',

    // Card and surface layers
    surface: '#FFFFFF',
    surfaceRaised: '#F5F3FF',

    // Content colors
    contentPrimary: '#1E1B4B',
    contentSecondary: '#64748B',
    contentTertiary: '#94A3B8',

    // Royal Purple Accent
    accent: '#6D28D9',

    // Semantic colors (Neon Green for success, Orange for warning)
    success: '#16A34A',
    warning: '#EA580C',
    danger: '#DC2626',
    info: '#6D28D9',

    // Interactive elements (Neon Green focus & interactive highlights)
    interactive: '#16A34A',
    focus: '#6D28D966',

    // Borders & dividers
    divider: '#E2E8F0',

    // Text contrast on backgrounds
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
    '0': 0, '1': 6, '2': 10, '3': 14, '4': 18, 'full': 9999
  },
  border: {
    width: 1,
    color: '#E2E8F0',
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

export const neonVioletLightTheme: ThemeDefinition = {
  manifest: neonVioletLightManifest,
  resolve: () => neonVioletLightResolvedTheme
};
