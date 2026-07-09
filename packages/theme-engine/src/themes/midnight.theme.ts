import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const midnightManifest: ThemeManifest = {
  id: 'Midnight',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.midnight.name',
  descriptionKey: 'appearance.themes.midnight.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const midnightResolvedTheme: ResolvedTheme = {
  colors: {
    // Deep OLED Blue/Black
    background: '#0B1220',
    backgroundSecondary: '#111A2B',
    
    // Surfaces
    surface: '#151F32',
    surfaceRaised: '#1E293B',
    
    // Content colors (light on dark)
    contentPrimary: '#F8FAFC',
    contentSecondary: '#94A3B8',
    contentTertiary: '#64748B',
    
    // Accents (Electric/Neon Blue)
    accent: '#38BDF8',
    
    // Semantic
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',
    
    // Interactive states
    interactive: '#38BDF8',
    focus: '#0284C7',
    
    // Borders
    divider: '#334155',
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
    color: '#334155',
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
    disabled: 0.4,
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

export const midnightTheme: ThemeDefinition = {
  manifest: midnightManifest,
  resolve: () => midnightResolvedTheme
};
