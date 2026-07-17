import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

// "Bosque" redesign — flips this theme from a dark pine palette to a light
// sage one (background/surface/content colors below are all light-register
// now), so supportsDarkIcons/supportsLightIcons flip to match (dark icons
// read correctly on a light background, same as the other 3 light themes).
export const forestManifest: ThemeManifest = {
  id: 'Forest',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.forest.name',
  descriptionKey: 'appearance.themes.forest.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const forestResolvedTheme: ResolvedTheme = {
  colors: {
    // Light sage / mint background
    background: '#F4F7F4',
    backgroundSecondary: '#E0E8E1',

    // Surfaces
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',

    // Content colors
    contentPrimary: '#14281A',
    contentSecondary: '#567A5E',
    contentTertiary: '#567A5E',

    // Accent (leaf green)
    accent: '#22C55E',

    // Semantic
    success: '#22C55E',
    warning: '#F5A623',
    danger: '#FF6B5E',
    info: '#22C55E',

    // Interactive states
    interactive: '#22C55E',
    focus: '#22C55E66',

    // Borders
    divider: '#E0E8E1',

    // Text-on-color pairs, verified against WCAG AA (see ResolvedTheme.ts).
    // Leaf-green accent is light enough that white text fails contrast
    // (2.28:1) — dark text passes at 6.84:1.
    contentOnAccent: '#14281A',
    contentOnSemantic: '#14281A',
  },
  typography: {
    fontFamily: 'Inter',
    fontFamilyBold: 'Inter-Bold',
  },
  spacing: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64
  },
  radius: {
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, full: 9999
  },
  border: {
    width: 1,
    color: '#E0E8E1',
  },
  elevation: {
    '0': 'none',
    '1': 'xs',
    '2': 'sm',
  },
  // Real values as of COMMITMENT_EXPERIENCE_GUIDE.md §5 — identical across
  // all 4 themes on purpose (Motion is a product-level standard, not a
  // per-theme aesthetic). See ResolvedTheme.ts's ThemeMotion doc comment.
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

export const forestTheme: ThemeDefinition = {
  manifest: forestManifest,
  resolve: () => forestResolvedTheme
};
