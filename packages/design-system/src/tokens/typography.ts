import { createFont } from 'tamagui';

// We map our semantic typography sizes to Inter font scales
// The user requested: display, headline, title, subtitle, body, label, caption, overline

export const interFont = createFont({
  family: 'Inter, Helvetica, Arial, sans-serif',
  size: {
    // semantic sizes mapped to numerical keys for Tamagui compatibility, or string keys
    display: 48,
    headline: 32,
    title: 24,
    subtitle: 20,
    body: 16,
    label: 14,
    caption: 12,
    overline: 10,
    true: 16, // fallback
  },
  lineHeight: {
    display: 56,
    headline: 40,
    title: 32,
    subtitle: 28,
    body: 24,
    label: 20,
    caption: 16,
    overline: 14,
    true: 24, // fallback
  },
  weight: {
    display: '700',
    headline: '700',
    title: '600',
    subtitle: '600',
    body: '400',
    label: '500',
    caption: '400',
    overline: '600',
    true: '400',
  },
  letterSpacing: {
    display: -1,
    headline: -0.5,
    title: -0.2,
    subtitle: 0,
    body: 0,
    label: 0.1,
    caption: 0.2,
    overline: 0.5,
    true: 0,
  },
  face: {
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
});
