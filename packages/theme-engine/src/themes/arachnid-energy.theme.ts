import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const arachnidEnergyManifest: ThemeManifest = {
  id: 'ArachnidEnergy',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.arachnidEnergy.name',
  descriptionKey: 'appearance.themes.arachnidEnergy.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const arachnidEnergyResolvedTheme: ResolvedTheme = {
  colors: {
    // Spiderman deep navy suit background
    background: '#0B0F19',
    backgroundSecondary: '#161D30',

    // Suit panels surface
    surface: '#1E2942',
    surfaceRaised: '#2A3754',

    // Content colors
    contentPrimary: '#FFFFFF',
    contentSecondary: '#90A4AE', // cool slate blue
    contentTertiary: '#607D8B',

    // Spiderman Suit Vibrant Red Accent
    accent: '#E53935',

    // Semantic
    success: '#4CAF50',
    warning: '#FFB300',
    danger: '#F44336',
    info: '#1E88E5', // Spiderman Suit Blue

    // Interactive
    interactive: '#E53935',
    focus: '#E5393566',

    // Borders
    divider: '#161D30',

    // White text on red accent
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
    // Elastic, web-shooter organic shapes
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, 'full': 9999
  },
  border: {
    width: 1,
    color: '#161D30',
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

export const arachnidEnergyTheme: ThemeDefinition = {
  manifest: arachnidEnergyManifest,
  resolve: () => arachnidEnergyResolvedTheme
};
