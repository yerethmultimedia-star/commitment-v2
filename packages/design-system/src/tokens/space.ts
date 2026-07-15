
// Named scale: base 4/8/12/16/20/24/32/40/48 (VS-031 Visual Design System
// consolidation, 2026 Q3). The numbered 0-12 scale below is spread over
// Tamagui's own default space tokens in tamagui.config.ts, so it overrides
// only the numbers redefined here — most call sites in this app use
// numbered tokens directly (padding="$4", gap="$2") rather than the named
// aliases, so recalibrating the numbers is what actually reaches those
// call sites. Kept identical to the named scale for the same reason the
// typography numbered scale mirrors its named one: one source of truth,
// no per-call-site rewrite needed.
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 56,
  11: 64,
  12: 72,
  '-1': -4,
  '-2': -8,
  '-3': -12,
  '-4': -16,
  '-5': -20,
  '-6': -24,
  '-7': -32,
  '-8': -40,
  '-9': -48,
  '-10': -56,
  '-11': -64,
  '-12': -72,
  true: 16,
};

export const size = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  true: 16,
};

export type SpaceTokens = `$${keyof typeof space}`;
