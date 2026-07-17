export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceRaised: string;
  contentPrimary: string;
  contentSecondary: string;
  contentTertiary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  interactive: string;
  focus: string;
  divider: string;
  /**
   * Text color for content rendered on top of `accent`/`interactive`
   * surfaces. Not a fixed white/black — some themes' accent is light enough
   * that white text fails WCAG AA (e.g. Sunrise's coral, Forest's olive), so
   * this is picked per theme rather than assumed.
   */
  contentOnAccent: string;
  /**
   * Text color for content on top of `success`/`warning`/`danger` surfaces.
   * Verified dark text clears WCAG AA (>=4.5:1) against all four shipped
   * themes' semantic colors, while white does not — see ADR-017 addendum /
   * VS-031 theme audit for the measured contrast ratios.
   */
  contentOnSemantic: string;
  // Fallbacks or extra
  [key: string]: string;
}

export interface ThemeTypography {
  // Can expand with font families, weights, etc.
  fontFamily: string;
  fontFamilyBold: string;
  [key: string]: any;
}

export interface ThemeSpacing {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6': number;
  '7': number;
  '8': number;
  [key: string]: number;
}

export interface ThemeRadius {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  full: number;
  [key: string]: number;
}

export interface ThemeBorder {
  width: number;
  color: string;
  [key: string]: any;
}

export interface ThemeElevation {
  '0': any;
  '1': any;
  '2': any;
  [key: string]: any;
}

/** Physical spring parameters — mass/damping/stiffness, not just a duration. */
export interface ThemeSpringConfig {
  mass: number;
  damping: number;
  stiffness: number;
}

/**
 * Real values (not `null` placeholders) as of COMMITMENT_EXPERIENCE_GUIDE.md
 * §5 — every field here is one of that guide's named durations/springs, not
 * an independent value to reinvent per theme. All 4 themes carry identical
 * values on purpose: Motion is a product-level standard, not a per-theme
 * aesthetic the way color is.
 */
export interface ThemeMotion {
  /** Generic tiers, aliased 1:1 to the semantic fields below (fast=buttonPress, normal=cardEntrance, slow=pageTransition). */
  fast: number;
  normal: number;
  slow: number;
  /** General-purpose spring (drag-to-dismiss, direct-manipulation surfaces) — same physical feel as modalTransition. */
  spring: ThemeSpringConfig;
  /** Screen-to-screen transition duration (ms). */
  pageTransition: number;
  /** Sheet/Dialog/Portal-content entrance. */
  modalTransition: ThemeSpringConfig;
  /** Press feedback (scale/opacity) duration (ms). */
  buttonPress: number;
  /** First-appearance fade+rise duration (ms) for cards. */
  cardEntrance: number;
  /** Per-item stagger delay (ms) when a list populates — not a duration itself. */
  listAnimation: number;
  [key: string]: any;
}

export interface ThemeIcons {
  style: 'solid' | 'outline' | 'thin';
  [key: string]: any;
}

export interface ThemeIllustrations {
  style: 'flat' | '3d' | 'line';
  [key: string]: any;
}

export interface ThemeOpacity {
  disabled: number;
  hover: number;
  press: number;
  [key: string]: number;
}

export interface ThemeZIndex {
  base: number;
  modal: number;
  popover: number;
  tooltip: number;
  [key: string]: number;
}

export interface ResolvedTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  border: ThemeBorder;
  elevation: ThemeElevation;
  motion: ThemeMotion;
  icons: ThemeIcons;
  illustrations: ThemeIllustrations;
  opacity: ThemeOpacity;
  zIndex: ThemeZIndex;
}
