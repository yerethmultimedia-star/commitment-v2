import { createFont } from 'tamagui';

// We map our semantic typography sizes to Inter font scales
// The user requested: display, headline, title, subtitle, body, label, caption, overline

export const interFont = createFont({
  family: 'Inter, Helvetica, Arial, sans-serif',
  size: {
    display: 48, headline: 32, title: 24, subtitle: 20,
    body: 16, label: 14, caption: 12, overline: 10,
    1: 10, 2: 12, 3: 14, 4: 16, 5: 20, 6: 24, 7: 32, 8: 48, 9: 64, 10: 72,
    true: 16,
  },
  lineHeight: {
    display: 56, headline: 40, title: 32, subtitle: 28,
    body: 24, label: 20, caption: 16, overline: 14,
    1: 14, 2: 16, 3: 20, 4: 24, 5: 28, 6: 32, 7: 40, 8: 56, 9: 72, 10: 80,
    true: 24,
  },
  weight: {
    display: '700', headline: '700', title: '600', subtitle: '600',
    body: '400', label: '500', caption: '400', overline: '600',
    1: '600', 2: '400', 3: '500', 4: '400', 5: '600', 6: '600', 7: '700', 8: '700', 9: '800', 10: '900',
    true: '400',
  },
  letterSpacing: {
    display: -1, headline: -0.5, title: -0.2, subtitle: 0,
    body: 0, label: 0.1, caption: 0.2, overline: 0.5,
    1: 0.5, 2: 0.2, 3: 0.1, 4: 0, 5: 0, 6: -0.2, 7: -0.5, 8: -1, 9: -1.5, 10: -2,
    true: 0,
  },
  face: {
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
});
