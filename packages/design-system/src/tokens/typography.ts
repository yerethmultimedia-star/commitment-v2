import { createFont } from 'tamagui';

// Semantic typography scale: display, headline, title, subtitle, body,
// label (= "body small"), caption, overline. Tightened per user feedback
// against a reference mockup — the prior "premium hierarchy" scale (see git
// history) read as noticeably oversized in practice, especially at the
// title/headline/display end used for screen headers and card titles.
//
// The 1-10 numbered scale is an alias of the SAME values, not a second,
// independently-tunable scale: most of the app calls fontSize="$5"-style
// numbered tokens directly rather than the named <Title>/<Body> components,
// so keeping both scales numerically identical means recalibrating here
// cascades to every existing call site without having to rewrite each one
// individually. If a call site's chosen number doesn't semantically match
// its role (e.g. a caption using $6), that's a follow-up per-component
// audit, not something a token-value change alone can fix.
export const interFont = createFont({
  family: 'Inter, Helvetica, Arial, sans-serif',
  size: {
    overline: 10, caption: 11, label: 13, body: 14,
    subtitle: 15, title: 17, headline: 20, display: 24,
    1: 10, 2: 11, 3: 13, 4: 14, 5: 15, 6: 17, 7: 20, 8: 24, 9: 30, 10: 34,
    true: 14,
  },
  lineHeight: {
    overline: 13, caption: 15, label: 18, body: 20,
    subtitle: 21, title: 22, headline: 25, display: 29,
    1: 13, 2: 15, 3: 18, 4: 20, 5: 21, 6: 22, 7: 25, 8: 29, 9: 34, 10: 37,
    true: 20,
  },
  weight: {
    overline: '600', caption: '400', label: '500', body: '400',
    subtitle: '600', title: '600', headline: '700', display: '700',
    1: '600', 2: '400', 3: '500', 4: '400', 5: '600', 6: '600', 7: '700', 8: '700', 9: '700', 10: '700',
    true: '400',
  },
  letterSpacing: {
    overline: 0.5, caption: 0.2, label: 0.1, body: 0,
    subtitle: 0, title: -0.2, headline: -0.5, display: -1,
    1: 0.5, 2: 0.2, 3: 0.1, 4: 0, 5: 0, 6: -0.2, 7: -0.5, 8: -1, 9: -1, 10: -1.5,
    true: 0,
  },
  face: {
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
});
