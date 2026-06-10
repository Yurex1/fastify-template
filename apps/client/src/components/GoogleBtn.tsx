import { useTranslation } from 'react-i18next';

export const GoogleBtn = () => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = import.meta.env.VITE_GOOGLE_AUTH;
      }}
      className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
    >
      <img src="/images/google-logo.svg" alt="Google" className="w-5 h-5" />
      {t('auth.google')}
    </button>
  );
};
