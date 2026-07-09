import i18next from 'i18next';

/**
 * Adapter to decouple the localization SDK from the underlying translation engine (i18next).
 */
class LocalizationAdapter {
  translate(key: string, options?: Record<string, any>): string {
    return i18next.t(key, options) as string;
  }
}

export const localizationAdapter = new LocalizationAdapter();
