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
import { loginSchema, type LoginFormData } from '../schemas/validation/schemas';

type FormData = {
  usernameOrEmail: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [parsedError, setParsedError] = useState<Error | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => signIn(data),
    onError: (err: Error) => setParsedError(err),
    onSuccess: () => {
      setParsedError(null);
      navigate(ROUTES.HOME);
    },
  });

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
      <form
        onSubmit={handleSubmit((data) => {
          setParsedError(null);
          mutate(data);
        })}
        className="space-y-4"
      >
        <div>
          <Input
            placeholder="Username or Email"
            {...register('usernameOrEmail')}
            onChange={() => setParsedError(null)}
          />
          {errors.usernameOrEmail && <p className="text-xs text-red-400 mt-1 ml-1">{errors.usernameOrEmail.message}</p>}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            {...register('password')}
            onChange={() => setParsedError(null)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-6 -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password.message}</p>}
        </div>

        <FormError message={parsedError} />

        <Button type="submit" loading={isPending}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
