import { exception } from '../exception/util';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { dictionary } from '@zxcvbn-ts/language-common';
import { translations } from '@zxcvbn-ts/language-en';

zxcvbnOptions.setOptions({
  dictionary,
  translations,
});

export const validatePassword = (password: string) => {
  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) {
    throw exception.badRequest('PASSWORD_IS_TOO_WEAK');
  }
};
