import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuthStore } from '../stores/auth';
import { ROUTES } from '../utils/consts/routes';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (registerData: typeof form) => signUp(registerData),
    onSuccess: () => {
      navigate(ROUTES.HOME);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form);
  };

  const inputs = [
    { id: 1, name: 'email', placeholder: 'Email', value: form.email, onChange: handleChange, required: true },
    { id: 2, name: 'username', placeholder: 'Username', value: form.username, onChange: handleChange, required: true },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4">
      <div className="p-6 space-y-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900/70 backdrop-blur shadow-xl p-8">
          {' '}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-semibold text-white">Create account</h1>
            <h3 className="text-sm text-neutral-400">Sign up to get started</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {inputs.map((input) => (
              <Input
                key={input.id}
                name={input.name}
                placeholder={input.placeholder}
                value={input.value}
                onChange={input.onChange}
                required={input.required}
              />
            ))}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{(error as Error).message || 'Registration failed'}</p>
            )}

            <Button type="submit" loading={isPending}>
              Sign up
            </Button>
          </form>
          <div className="text-center mt-4 text-sm text-neutral-400">
            Already have an account?{' '}
            <span onClick={() => navigate(ROUTES.LOGIN)} className="text-white cursor-pointer hover:underline">
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
