import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AuthCard } from '../components/AuthCard';
import { FormError } from '../components/FormError';
import { useAuthStore } from '../stores/auth';
import { ROUTES } from '../utils/consts/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/validation/schemas';

type FormData = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.register);

  const [showField, setShowField] = useState<'none' | 'password' | 'confirm'>('none');
  const [parsedError, setParsedError] = useState<Error | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });
  const password = watch('password');

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, username, password }: FormData) => signUp({ email, username, password }),
    onError: (err: Error) => setParsedError(err),
    onSuccess: () => {
      setParsedError(null);
      navigate(ROUTES.HOME);
    },
  });

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
      <form
        onSubmit={handleSubmit((data) => {
          setParsedError(null);
          mutate(data);
        })}
        className="space-y-4"
      >
        <div>
          <Input
            placeholder="Email"
            autoComplete="email"
            {...register('email', { required: 'Email is required' })}
            onChangeCapture={() => setParsedError(null)}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <div>
          <Input
            placeholder="Username"
            autoComplete="username"
            {...register('username', { required: 'Username is required' })}
            onChangeCapture={() => setParsedError(null)}
          />
          {errors.username && <p className="text-xs text-red-400 mt-1 ml-1">{errors.username.message}</p>}
        </div>

        <div className="relative">
          <Input
            type={showField === 'password' ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="new-password"
            {...register('password', { required: 'Password is required' })}
            onChangeCapture={() => setParsedError(null)}
          />
          <button
            type="button"
            onClick={() => setShowField((prev) => (prev === 'password' ? 'none' : 'password'))}
            className="absolute right-3 top-6 -translate-y-1/2 text-neutral-400"
          >
            {showField === 'password' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password.message}</p>}
        </div>

        <div className="relative">
          <Input
            type={showField === 'confirm' ? 'text' : 'password'}
            placeholder="Confirm password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === password || 'Passwords do not match',
            })}
            onChangeCapture={() => setParsedError(null)}
          />
          <button
            type="button"
            onClick={() => setShowField((prev) => (prev === 'confirm' ? 'none' : 'confirm'))}
            className="absolute right-3 top-6 -translate-y-1/2 text-neutral-400"
          >
            {showField === 'confirm' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 ml-1">{errors.confirmPassword.message}</p>}
          {!errors.confirmPassword && watch('confirmPassword')?.length > 0 && (
            <p className="text-xs text-emerald-400 mt-1 ml-1">Passwords match ✓</p>
          )}
        </div>

        <FormError message={parsedError} />
        <Button type="submit" loading={isPending}>
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
