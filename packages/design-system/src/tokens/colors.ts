export const ColorTokens = {
  light: {
    surface: {
      primary: '#F9F9F8',
      secondary: '#F0F0EE',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666663',
    },
  },
  dark: {
    surface: {
      primary: '#000000',
      secondary: '#121212',
    },
    text: {
      primary: '#E6E6E4',
      secondary: '#999996',
    },
  },
  accent: {
    resilience: '#1B3B2B', // Verde bosque profundo
    pause: '#4A3B2C',       // Ámbar cálido terroso
  },
} as const;

export const SpacingTokens = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
  xxl: 64,
} as const;

export const TypographyTokens = {
  heading: {
    identity: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    title: {
      fontSize: 22,
      fontWeight: '500',
      lineHeight: 1.3,
    },
  },
  body: {
    primary: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    secondary: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.4,
    },
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 1.3,
    letterSpacing: 0.5,
  },
} as const;
