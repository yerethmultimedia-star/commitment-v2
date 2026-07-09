import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const sunriseManifest: ThemeManifest = {
  id: 'Sunrise',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.sunrise.name',
  descriptionKey: 'appearance.themes.sunrise.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const sunriseResolvedTheme: ResolvedTheme = {
  colors: {
    // Ivory / Warm white background instead of #FFFFFF
    background: '#FDFBF7', 
    backgroundSecondary: '#F5F2EB',
    
    // Surfaces remain light but distinct from background
    surface: '#FFFFFF',
    surfaceRaised: '#FAF7F2',
    
    // Content colors
    contentPrimary: '#2C2A26',
    contentSecondary: '#5E5B55',
    contentTertiary: '#9E9A92',
    
    // Accents (Warm Sunrise Orange/Coral)
    accent: '#FF7B54',
    
    // Semantic
    success: '#34A853',
    warning: '#FBBC05',
    danger: '#EA4335',
    info: '#4285F4',
    
    // Interactive states
    interactive: '#FF7B54',
    focus: '#FFD5C8',
    
    // Borders
    divider: '#E8E4D9',
  },
  typography: {
    fontFamily: 'Inter',
    fontFamilyBold: 'Inter-Bold',
  },
  spacing: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64
  },
  radius: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, full: 9999
  },
  border: {
    width: 1,
    color: '#E8E4D9',
  },
  elevation: {
    '0': 'none',
    '1': 'sm',
    '2': 'md',
  },
  motion: {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: null,
    pageTransition: null,
    modalTransition: null,
    buttonPress: null,
    cardEntrance: null,
    listAnimation: null
  },
  icons: {
    style: 'solid'
  },
  illustrations: {
    style: 'flat'
  },
  opacity: {
    disabled: 0.5,
    hover: 0.8,
    press: 0.6
  },
  zIndex: {
    base: 0,
    modal: 100,
    popover: 200,
    tooltip: 300
  }
};

export const sunriseTheme: ThemeDefinition = {
  manifest: sunriseManifest,
  resolve: () => sunriseResolvedTheme
};
