import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../stores/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import googleIcon from '/images/google-logo.svg';

export const GoogleBtn = () => {
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      await loginWithGoogle(response.access_token);
      navigate('/');
    },
    onError: () => console.error('Google login failed'),
    flow: 'implicit',
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="w-full rounded-xl bg-white text-black font-medium py-2.5 transition hover:bg-neutral-200
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <img src={googleIcon} alt="Google" className="w-5 h-5" />
      {t('auth.google')}
    </button>
  );
};
