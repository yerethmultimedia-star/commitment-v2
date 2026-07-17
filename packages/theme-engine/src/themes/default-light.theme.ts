import { ThemeDefinition, ThemeManifest, ResolvedTheme } from '../index.js';

export const defaultLightManifest: ThemeManifest = {
  id: 'DefaultLight',
  version: '1.0.0',
  manifestVersion: '1.0.0',
  engineVersion: '1.0.0',
  nameKey: 'appearance.themes.defaultLight.name',
  descriptionKey: 'appearance.themes.defaultLight.description',
  author: 'Commitment',
  supportsDarkIcons: true,
  supportsLightIcons: false,
};

export const defaultLightResolvedTheme: ResolvedTheme = {
  colors: {
    // Very light neutral gray, not pure white — lets white cards read as elevated
    background: '#F5F5F8',
    backgroundSecondary: '#E7E7EF',

    // Cards are true white with a very subtle separation from the page
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',

    // Content colors
    contentPrimary: '#18181F',
    contentSecondary: '#6B6B76',
    contentTertiary: '#6B6B76',

    // Accent (premium violet)
    accent: '#6C4EFF',

    // Semantic
    success: '#22C55E',
    warning: '#F5A623',
    danger: '#FF6B5E',
    info: '#6C4EFF',

    // Interactive states — violet primary, accent tint for focus rings
    interactive: '#6C4EFF',
    focus: '#6C4EFF66',

    // Borders
    divider: '#E7E7EF',

    // Text-on-color pairs, verified against WCAG AA (see ResolvedTheme.ts —
    // 5.03:1 white-on-accent, 7.75:1 dark-on-semantic, both comfortably pass).
    contentOnAccent: '#FFFFFF',
    contentOnSemantic: '#18181F',
  },
  typography: {
    fontFamily: 'Inter',
    fontFamilyBold: 'Inter-Bold',
  },
  spacing: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64
  },
  radius: {
    // 16-20px surface radius per spec — '3'/'4' are what Card/Button variants
    // reach for most often, so those carry the bump; '2' stays a usable
    // "small control" radius rather than jumping straight to 16.
    '0': 0, '1': 8, '2': 12, '3': 16, '4': 20, full: 9999
  },
  border: {
    width: 1,
    color: '#E7E7EF',
  },
  elevation: {
    // Deliberately subtle — spec calls for no aggressive shadows
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

export const defaultLightTheme: ThemeDefinition = {
  manifest: defaultLightManifest,
  resolve: () => defaultLightResolvedTheme
};
