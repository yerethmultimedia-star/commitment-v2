import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const fierySpiritManifest: ThemeManifest = {
  id: 'FierySpirit',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.fierySpirit.name',
  descriptionKey: 'appearance.themes.fierySpirit.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const fierySpiritResolvedTheme: ResolvedTheme = {
  colors: {
    // Goku warm orange/peach tint canvas background
    background: '#FFF5F2',
    backgroundSecondary: '#FFEAE5',

    // White surfaces
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',

    // Contrast content colors (deep warm dark brown for premium readability)
    contentPrimary: '#3E2723',
    contentSecondary: '#795548',
    contentTertiary: '#BCAAA4',

    // Goku Gi Orange Accent
    accent: '#FF6D00',

    // Semantic
    success: '#2E7D32',
    warning: '#FFA000',
    danger: '#D84315',
    info: '#1A237E', // Goku navy blue belt/undershirt

    // Interactive
    interactive: '#FF6D00',
    focus: '#FF6D0066',

    // Borders
    divider: '#FFEAE5',

    // White text on orange accent
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
    // Friendly, organic, high energy rounded corners
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, 'full': 9999
  },
  border: {
    width: 1,
    color: '#FFEAE5',
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

export const fierySpiritTheme: ThemeDefinition = {
  manifest: fierySpiritManifest,
  resolve: () => fierySpiritResolvedTheme
};
