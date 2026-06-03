import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AuthCard } from '../components/AuthCard';
import { FormError } from '../components/FormError';
import { useAuthStore } from '../stores/auth';
import { ROUTES } from '../utils/consts/routes';
import { parseApiError } from '../components/FormError';

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [parsedError, setParsedError] = useState<Error | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: typeof form) => {
      try {
        return await signIn(data);
      } catch (err) {
        const parsed = await parseApiError(err);
        throw parsed;
      }
    },

    onError: (err: Error) => {
      setParsedError(err);
      console.error('Login error:', err.message);
    },

    onSuccess: () => {
      setParsedError(null);
      navigate(ROUTES.HOME);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setParsedError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParsedError(null);
    mutate(form);
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Enter your credentials to continue"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <span onClick={() => navigate(ROUTES.REGISTER)} className="text-white cursor-pointer hover:underline">
            Sign up
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="usernameOrEmail"
          placeholder="Username or Email"
          value={form.usernameOrEmail}
          onChange={handleChange}
          required
        />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <FormError message={parsedError} />

        <Button type="submit" loading={isPending}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
