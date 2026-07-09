import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const forestManifest: ThemeManifest = {
  id: 'Forest',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.forest.name',
  descriptionKey: 'appearance.themes.forest.description',
  author: 'Commitment',
  supportsDarkIcons: false,
  supportsLightIcons: true,
};

export const forestResolvedTheme: ResolvedTheme = {
  colors: {
    // Pine / Dark Moss background
    background: '#1A211D',
    backgroundSecondary: '#212A25',
    
    // Surfaces
    surface: '#29352F',
    surfaceRaised: '#334038',
    
    // Content colors (light earthy tones on dark)
    contentPrimary: '#EBEAE4',
    contentSecondary: '#A9ACA4',
    contentTertiary: '#7F847A',
    
    // Accents (Soft Olive / Golden Moss)
    accent: '#A3B18A',
    
    // Semantic
    success: '#84A59D',
    warning: '#D4A373',
    danger: '#E07A5F',
    info: '#669BBC',
    
    // Interactive states
    interactive: '#A3B18A',
    focus: '#588157',
    
    // Borders
    divider: '#3E4A43',
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
    color: '#3E4A43',
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

export const forestTheme: ThemeDefinition = {
  manifest: forestManifest,
  resolve: () => forestResolvedTheme
};
