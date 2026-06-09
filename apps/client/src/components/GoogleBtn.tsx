import { useTranslation } from 'react-i18next';

export const GoogleBtn = () => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = 'http://localhost:9000/auth/google';
      }}
      className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      {t('auth.google')}
    </button>
  );
};
