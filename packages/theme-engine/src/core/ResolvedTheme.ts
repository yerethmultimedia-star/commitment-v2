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

export interface ThemeMotion {
  fast: number;
  normal: number;
  slow: number;
  spring: any;
  pageTransition: any;
  modalTransition: any;
  buttonPress: any;
  cardEntrance: any;
  listAnimation: any;
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
