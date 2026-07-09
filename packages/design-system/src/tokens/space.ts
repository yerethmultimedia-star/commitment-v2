
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  true: 16,
};

export const size = {
  ...space,
  true: 16,
};

export type SpaceTokens = `$${keyof typeof space}`;
