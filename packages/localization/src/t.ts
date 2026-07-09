import { localizationAdapter } from './adapter.js';

/**
 * A standalone translation function.
 * This is decoupled from any specific engine implementation via LocalizationAdapter.
 */
export const t = (key: string, options?: Record<string, any>): string => {
  return localizationAdapter.translate(key, options);
};
