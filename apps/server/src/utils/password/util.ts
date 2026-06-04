import { exception } from '../exception/util';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { dictionary } from '@zxcvbn-ts/language-common';
import { translations } from '@zxcvbn-ts/language-en';

zxcvbnOptions.setOptions({
  dictionary,
  translations,
});

export const validatePassword = (password: string, email: string, username: string) => {
  if (password.length < 12) throw exception.badRequest('Password is too short, at list 12 symbols');
  if (password.includes(email)) throw exception.badRequest('Password contains email');
  if (password === username) throw exception.badRequest('Password equals username');
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const isValid = passwordRegex.test(password);
  if (!isValid) {
    throw exception.badRequest('Password must constain uppercase, lowercase, number and symbol');
  }
  const passwordStrength = zxcvbn(password);

  if (passwordStrength.score < 3) {
    throw exception.badRequest('Password is too week');
  }
};
