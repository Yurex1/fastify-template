import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setCurrentUser } = useAuthStore();
  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const error = searchParams.get('error');
    const userParam = searchParams.get('user');
    // TODO error handling for google auth error
    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (accessToken && userParam) {
      try {
        const user = JSON.parse(atob(userParam));
        setAccessToken(accessToken);
        setCurrentUser(user);
        useAuthStore.setState({ isAuthenticated: true });
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Failed to login from callback:', err);
        navigate('/login?error=login_failed');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Completing login...</p>
    </div>
  );
}
