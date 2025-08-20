import jsonwebtoken from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../../config.js';
import { exception } from '../exception/util.js';

export const jwt = {
  sign: (payload: object, expiresIn: SignOptions['expiresIn']): string => {
    return jsonwebtoken.sign(payload, config.jwt.secret, {
      expiresIn,
    });
  },

  verify: (token: string) => {
    try {
      return jsonwebtoken.verify(token, config.jwt.secret);
    } catch {
      throw exception.unauthorized('TOKEN_VALIDATION_FAILED');
    }
  },
};
