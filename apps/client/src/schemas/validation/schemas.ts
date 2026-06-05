import { z } from 'zod';
import i18next from '../../i18next';

export const registerSchema = z
  .object({
    username: z
      .string({
        error: () => ({ message: i18next.t('auth.registration.validations.firstNameRequired') }),
      })
      .min(1, i18next.t('auth.registration.validations.firstNameRequired'))
      .max(100, i18next.t('common.validation.maxLength')),
    email: z
      .string({
        error: () => ({ message: i18next.t('auth.common.invalidEmail') }),
      })
      .email(i18next.t('auth.common.invalidEmail'))
      .max(100, i18next.t('common.validation.maxLength')),
    password: z
      .string({
        error: () => ({ message: i18next.t('auth.registration.validations.passwordMinLength') }),
      })
      .min(12, i18next.t('auth.registration.validations.passwordMinLength'))
      .max(100, i18next.t('common.validation.maxLength'))
      .regex(/[A-Z]/, i18next.t('auth.registration.validations.passwordUpperCase'))
      .regex(/[a-z]/, i18next.t('auth.registration.validations.passwordLowerCase'))
      .regex(/[0-9]/, i18next.t('auth.registration.validations.passwordNumber'))
      .regex(/[!@#$%&*.()_=+[\]{}|;:,.<>?~^/-]/, i18next.t('auth.registration.validations.passwordSpecialCharacter')),
    confirmPassword: z
      .string({
        error: () => ({ message: i18next.t('auth.registration.validations.passwordMinLength') }),
      })
      .min(12, i18next.t('auth.registration.validations.passwordMinLength')),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: i18next.t('auth.common.validation.passwordsDoNotMatch'),
        path: ['confirmPassword'],
      });
    }
  });

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'This field is required'),
  password: z.string().min(1, 'This field is required'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
