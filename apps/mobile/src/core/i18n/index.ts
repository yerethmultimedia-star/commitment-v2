import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { resources } from './resources';

const getDeviceLanguage = () => {
  const languageCode = Localization.getLocales()[0]?.languageCode;
  return languageCode === 'es' ? 'es' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(), // Fallback to device language
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
