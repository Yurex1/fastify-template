import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string({
        error: () => ({ message: 'common.fieldRequired' }),
      })
      .min(1, 'common.fieldRequired')
      .max(30, 'common.validation.maxLength'),
    email: z
      .string({
        error: () => ({ message: 'common.invalidEmail' }),
      })
      .min(1, 'common.fieldRequired')
      .email('common.invalidEmail'),
    password: z
      .string({
        error: () => ({ message: 'auth.registration.validations.passwordMinLength' }),
      })
      .min(12, 'auth.registration.validations.passwordMinLength')
      .max(64, 'common.validation.maxLength')
      .regex(/[A-Z]/, 'auth.registration.validations.passwordUpperCase')
      .regex(/[a-z]/, 'auth.registration.validations.passwordLowerCase')
      .regex(/[0-9]/, 'auth.registration.validations.passwordNumber')
      .regex(/[!@#$%&*.()_=+[\]{}|;:,.<>?~^/-]/, 'auth.registration.validations.passwordSpecialCharacter'),
    confirmPassword: z
      .string({
        error: () => ({ message: 'auth.registration.validations.passwordMinLength' }),
      })
      .min(12, 'auth.registration.validations.passwordMinLength'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'common.validation.passwordsDoNotMatch',
        path: ['confirmPassword'],
      });
    }
  });

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'common.fieldRequired'),
  password: z.string().min(1, 'common.fieldRequired'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
