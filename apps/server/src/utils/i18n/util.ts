import i18n from 'i18next';
import en from '../../../../client/public/locales/en/translation.json';
import uk from '../../../../client/public/locales/uk/translation.json';

i18n.init({
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
});

export const t = (key: string, lng?: string) => {
  const targetLng = lng || i18n.language || 'en';
  const normalizedLng = targetLng.split('-')[0];
  return i18n.t(key, { lng: normalizedLng });
};
