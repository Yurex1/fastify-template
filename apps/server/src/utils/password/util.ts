import { exception } from '../exception/util';
import { t } from '../i18n/util';

import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { dictionary } from '@zxcvbn-ts/language-common';
import { translations } from '@zxcvbn-ts/language-en';

zxcvbnOptions.setOptions({
  dictionary,
  translations,
});

export const validatePassword = (password: string, email: string, username: string, lang: string) => {
  if (password.length < 12) throw exception.badRequest(t('auth.password.tooShort', lang));
  if (password.includes(email)) throw exception.badRequest(t('auth.password.containsEmail', lang));
  if (password === username) throw exception.badRequest(t('auth.password.equalsUsername', lang));

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) throw exception.badRequest(t('auth.password.invalidFormat', lang));

  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) throw exception.badRequest(t('auth.password.tooWeak', lang));
};
