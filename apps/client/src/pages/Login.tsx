import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../stores/auth';
import { ROUTES } from '../utils/consts/routes';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '../utils/handleErrors';

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (loginData: { usernameOrEmail: string; password: string }) => signIn(loginData),
    onSuccess: () => navigate(ROUTES.HOME),
    onError: async (error) => {
      const message = await getErrorMessage(error);
      setErrorMessage(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4">
      <div className="p-6 space-y-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900/70 backdrop-blur shadow-xl p-8">
          {' '}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-semibold text-white">Sign in</h1>
            <h3 className="text-sm text-neutral-400">Enter your credentials to continue</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                name="usernameOrEmail"
                placeholder="Username or Email"
                autoComplete="username"
                value={form.usernameOrEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={isPending}>
              Sign in
            </Button>
          </form>
          <div className="text-center text-sm text-neutral-400 mt-1">
            Don&apos;t have an account?{' '}
            <span onClick={() => navigate(ROUTES.REGISTER)} className="text-white cursor-pointer hover:underline">
              Sign up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
