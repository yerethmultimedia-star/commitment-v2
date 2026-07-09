import { ResolvedTheme } from './ResolvedTheme.js';

export interface ResolvedAppearance {
  theme: ResolvedTheme;
  locale: string;
  isReducedMotion: boolean;
  isHighContrast: boolean;
}
