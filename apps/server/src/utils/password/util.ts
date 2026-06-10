import { exception } from '../exception/util';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { dictionary } from '@zxcvbn-ts/language-common';
import { translations } from '@zxcvbn-ts/language-en';

zxcvbnOptions.setOptions({
  dictionary,
  translations,
});

export const validatePassword = (password: string, email: string, username: string) => {
  if (password.length < 12) {
    throw exception.badRequest('PASSWORD_IS_TOO_SHORT');
  }

  if (password.includes(email)) {
    throw exception.badRequest('PASSWORD_CONTAINS_EMAIL');
  }

  if (password === username) {
    throw exception.badRequest('PASSWORD_EQUALS_USERNAME');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw exception.badRequest('PASSWORD_INVALID_FORMAT');
  }

  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) {
    throw exception.badRequest('PASSWORD_IS_TOO_WEAK');
  }
};
