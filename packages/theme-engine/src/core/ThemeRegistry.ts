import { ThemeManifest, ThemeId } from './ThemeManifest.js';
import { ResolvedTheme } from './ResolvedTheme.js';

export interface ThemeDefinition {
  manifest: ThemeManifest;
  resolve: () => ResolvedTheme; // Can be a function to support lazy loading / dynamic derivation
}

export class ThemeRegistry {
  private themes = new Map<ThemeId, ThemeDefinition>();

  public register(definition: ThemeDefinition): void {
    if (this.themes.has(definition.manifest.id)) {
      console.warn(`[ThemeRegistry] Theme ${definition.manifest.id} is already registered. Overwriting.`);
    }
    this.themes.set(definition.manifest.id, definition);
  }

  public getManifest(id: ThemeId): ThemeManifest | undefined {
    return this.themes.get(id)?.manifest;
  }

  public resolve(id: ThemeId): ResolvedTheme {
    const definition = this.themes.get(id);
    if (!definition) {
      throw new Error(`[ThemeRegistry] Theme ${id} not found.`);
    }
    return definition.resolve();
  }

  public getAllManifests(): ThemeManifest[] {
    return Array.from(this.themes.values()).map(def => def.manifest);
  }
}
