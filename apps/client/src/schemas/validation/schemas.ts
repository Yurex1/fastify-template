import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    username: z.string().min(1, 'Username is required').max(30, 'Username is too long'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(64, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'This field is required'),
  password: z.string().min(1, 'This field is required'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
