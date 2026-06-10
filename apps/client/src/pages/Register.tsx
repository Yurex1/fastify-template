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
import { useTranslation } from 'react-i18next';
import { GoogleBtn } from '../components/GoogleBtn';

export default function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.register);
  const { t } = useTranslation();

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

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, username, password }: RegisterFormData) => signUp({ email, username, password }),
    onError: (err: Error) => setParsedError(err),
    onSuccess: () => {
      setParsedError(null);
      navigate(ROUTES.HOME);
    },
  });

  return (
    <AuthCard
      title={t('auth.registration.title')}
      subtitle={t('auth.registration.subtitle')}
      footer={
        <>
          {t(`auth.registration.alreadyHaveAccount`)}{' '}
          <span onClick={() => navigate(ROUTES.LOGIN)} className="text-white cursor-pointer hover:underline">
            {t(`auth.registration.signIn`)}
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
            placeholder={t('common.email')}
            autoComplete="email"
            {...register('email')}
            onChangeCapture={() => setParsedError(null)}
          />
        </div>

        <div>
          <Input
            placeholder={t('common.username')}
            autoComplete="username"
            {...register('username')}
            onChangeCapture={() => setParsedError(null)}
          />
        </div>

        <div className="relative">
          <Input
            type={showField === 'password' ? 'text' : 'password'}
            placeholder={t('common.password')}
            autoComplete="new-password"
            {...register('password')}
            onChangeCapture={() => setParsedError(null)}
          />
          <button
            type="button"
            onClick={() => setShowField((prev) => (prev === 'password' ? 'none' : 'password'))}
            className="absolute right-3 top-6 -translate-y-1/2 text-neutral-400"
          >
            {showField === 'password' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{t(`${errors.password.message}`)}</p>}
        </div>

        <div className="relative">
          <Input
            type={showField === 'confirm' ? 'text' : 'password'}
            placeholder={t('common.confirmPassword')}
            autoComplete="new-password"
            {...register('confirmPassword')}
            onChangeCapture={() => setParsedError(null)}
          />
          <button
            type="button"
            onClick={() => setShowField((prev) => (prev === 'confirm' ? 'none' : 'confirm'))}
            className="absolute right-3 top-6 -translate-y-1/2 text-neutral-400"
          >
            {showField === 'confirm' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1 ml-1">{t(`${errors.confirmPassword.message}`)}</p>
          )}
          {!errors.confirmPassword && watch('confirmPassword')?.length > 0 && (
            <p className="text-xs text-emerald-400 mt-1 ml-1">{t('common.validation.passwordsDoMatch')} ✓</p>
          )}
        </div>

        {parsedError && <FormError message={t(`auth.registration.validations.${parsedError.message.toLowerCase()}`)} />}
        <GoogleBtn />
        <Button type="submit" loading={isPending}>
          {t('auth.registration.signUp')}
        </Button>
      </form>
    </AuthCard>
  );
}
