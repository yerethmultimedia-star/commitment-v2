import { ThemeRegistry, ThemeDefinition, ResolvedTheme } from '@commitment/theme-engine';

export const appThemeRegistry = new ThemeRegistry();

// Create a mock Sunrise theme for VS-026. VS-027 will implement real themes.
const mockSunriseResolvedTheme: ResolvedTheme = {
  colors: {
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceRaised: '#F1F3F5',
    contentPrimary: '#212529',
    contentSecondary: '#495057',
    contentTertiary: '#868E96',
    accent: '#FD7E14',
    success: '#40C057',
    warning: '#FCC419',
    danger: '#FA5252',
    info: '#228BE6',
    interactive: '#FD7E14',
    focus: '#FFD8A8',
    divider: '#E9ECEF',
  },
  typography: { fontFamily: 'Inter', fontFamilyBold: 'Inter-Bold' },
  spacing: { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 24, '6': 32, '7': 48, '8': 64 },
  radius: { '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, full: 9999 },
  border: { width: 1, color: '#E9ECEF' },
  elevation: { '0': 'none', '1': 'sm', '2': 'md' },
  motion: {
    fast: 150, normal: 300, slow: 500,
    spring: null, pageTransition: null, modalTransition: null, buttonPress: null, cardEntrance: null, listAnimation: null
  },
  icons: { style: 'solid' },
  illustrations: { style: 'flat' },
  opacity: { disabled: 0.5, hover: 0.8, press: 0.6 },
  zIndex: { base: 0, modal: 100, popover: 200, tooltip: 300 }
};

const sunriseThemeDef: ThemeDefinition = {
  manifest: {
    id: 'Sunrise',
    version: '1.0.0',
    nameKey: 'theme.sunrise.name',
    descriptionKey: 'theme.sunrise.desc',
    author: 'Commitment',
    supportsDarkIcons: true,
    supportsLightIcons: false,
    minimumEngineVersion: '1.0.0'
  },
  resolve: () => mockSunriseResolvedTheme
};

appThemeRegistry.register(sunriseThemeDef);
