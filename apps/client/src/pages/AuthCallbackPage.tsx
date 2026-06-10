import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { Loader } from '../components/Loader';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  function handleCallback() {
    const success = searchParams.get('status');
    const userCookie = Cookies.get('user');

    if (!success || !userCookie) {
      navigate('/login?error=no_user', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userCookie);
      setCurrentUser(user);
      useAuthStore.setState({ isAuthenticated: true });
      navigate('/', { replace: true });
    } catch {
      navigate('/login?error=login_failed', { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <Loader />
    </div>
  );
}
