import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AuthCard } from '../components/AuthCard';
import { FormError, parseApiError } from '../components/FormError';
import { useAuthStore } from '../stores/auth';
import { ROUTES } from '../utils/consts/routes';
import { REGISTER_INPUT_CONFIGS } from '../utils/consts/inputs';

export default function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.register);

  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [parsedError, setParsedError] = useState<Error | null>(null);

  const passwordMismatch = confirmPassword.length > 0 && form.password !== confirmPassword;
  const passwordMatch = confirmPassword.length > 0 && form.password === confirmPassword;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: typeof form) => {
      try {
        return await signUp(data);
      } catch (err) {
        const parsed = await parseApiError(err);
        throw parsed;
      }
    },
    onError: (err: Error) => setParsedError(err),
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
    if (form.password !== confirmPassword) {
      setParsedError(new Error('Passwords do not match'));
      return;
    }
    setParsedError(null);
    mutate(form);
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{' '}
          <span onClick={() => navigate(ROUTES.LOGIN)} className="text-white cursor-pointer hover:underline">
            Sign in
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {REGISTER_INPUT_CONFIGS.map((input) => (
          <Input
            key={input.id}
            name={input.name}
            placeholder={input.placeholder}
            autoComplete={input.autoComplete}
            value={form[input.name]}
            onChange={handleChange}
            required
          />
        ))}

        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
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

        <div className="relative">
          <Input
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setParsedError(null);
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {passwordMismatch && <p className="text-xs text-red-400 mt-1 ml-1">Passwords do not match</p>}
          {passwordMatch && <p className="text-xs text-emerald-400 mt-1 ml-1">Passwords match ✓</p>}
        </div>

        <FormError message={parsedError} />
        <Button type="submit" loading={isPending} disabled={passwordMismatch}>
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
