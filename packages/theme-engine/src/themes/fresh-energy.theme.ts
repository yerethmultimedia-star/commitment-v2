import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const freshEnergyManifest: ThemeManifest = {
  id: 'FreshEnergy',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.freshEnergy.name',
  descriptionKey: 'appearance.themes.freshEnergy.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const freshEnergyResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    contentPrimary: '#1F2937',
    contentSecondary: '#4B5563',
    contentTertiary: '#9CA3AF',
    accent: '#06C167',
    success: '#06C167',
    warning: '#F5A623',
    danger: '#EF4444',
    info: '#06C167',
    interactive: '#06C167',
    focus: '#06C16766',
    divider: '#E5E7EB',
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
    '0': 0, '1': 4, '2': 6, '3': 8, '4': 12, 'full': 9999
  },
  border: {
    width: 1,
    color: '#E5E7EB',
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

export const freshEnergyTheme: ThemeDefinition = {
  manifest: freshEnergyManifest,
  resolve: () => freshEnergyResolvedTheme
};
