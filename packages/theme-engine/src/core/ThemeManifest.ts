export type ThemeId = 'Sunrise' | 'Midnight' | 'Forest' | string;

export interface ThemeManifest {
  /** Unique identifier for the theme */
  id: ThemeId;
  /** Version of the theme in semver format */
  version: string;
  /** i18n key for the localized name */
  nameKey: string;
  /** i18n key for the localized description */
  descriptionKey: string;
  /** Author or creator of the theme */
  author: string;
  /** URL or asset path for a preview image */
  preview?: string;
  /** Whether this theme looks best with dark icons in the OS status bar */
  supportsDarkIcons: boolean;
  /** Whether this theme looks best with light icons in the OS status bar */
  supportsLightIcons: boolean;
  /** Minimum version of the theme engine required to parse this theme */
  minimumEngineVersion: string;
}
