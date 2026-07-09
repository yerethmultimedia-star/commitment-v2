import { ThemeId } from './ThemeManifest.js';

export interface AppearanceContext {
  themeId: ThemeId;
  locale: string;
  reducedMotion: boolean;
  highContrast: boolean;
  // Other preferences like typography scaling could go here
}
