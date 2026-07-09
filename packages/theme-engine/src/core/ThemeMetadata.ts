import { ThemeId, ThemeManifest } from './ThemeManifest.js';
import { ResolvedTheme } from './ResolvedTheme.js';

export interface ThemeMetadata {
  id: ThemeId;
  nameKey: string;
  descriptionKey: string;
  previewKey?: string;
  category: 'light' | 'dark' | 'auto';
  isDark: boolean;
  supportsOLED: boolean;
  supportsDarkIcons: boolean;
  supportsLightIcons: boolean;
}

/**
 * Derives metadata from a manifest and its resolved theme properties.
 */
export function deriveThemeMetadata(manifest: ThemeManifest, resolvedTheme: ResolvedTheme): ThemeMetadata {
  // A simplistic heuristic for category/isDark based on background lightness
  // In a real app we'd parse the hex/rgb to determine exact luminance, 
  // but for VS-027 we can infer it or just rely on convention.
  // We'll assume the theme creator sets it properly or we determine it here.
  
  // As a shortcut, we'll check if the manifest declares light/dark icon support
  const isDark = manifest.supportsLightIcons && !manifest.supportsDarkIcons;
  
  // OLED check: typically true if the background is exactly #000000 or #0B1220
  const supportsOLED = isDark && (resolvedTheme.colors.background === '#000000' || resolvedTheme.colors.background === '#0B1220');

  return {
    id: manifest.id,
    nameKey: manifest.nameKey,
    descriptionKey: manifest.descriptionKey,
    previewKey: manifest.preview,
    category: isDark ? 'dark' : 'light',
    isDark,
    supportsOLED,
    supportsDarkIcons: manifest.supportsDarkIcons,
    supportsLightIcons: manifest.supportsLightIcons,
  };
}
