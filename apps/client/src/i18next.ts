import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import en from '../public/locales/en/translation.json';
import useUserStore from './stores/user';
const savedLang = useUserStore.getState().language;

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],

    load: 'languageOnly',
    partialBundledLanguages: true,
    pluralSeparator: '_',

    resources: {
      en: { translation: en },
    },

    ns: ['translation'],
    defaultNS: 'translation',

    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
