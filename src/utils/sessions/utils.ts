import { SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import { UserResult } from '../../entities/user';
import { exception } from '../exception/util';
import { jwt } from './jwt';
import { Session } from './types';

export const sessions = {
  generate: (user: UserResult): Session => {
    const { id } = user;
    const accessToken = jwt.sign(
      { id, type: 'access' },
      config.jwt.expiration.access as SignOptions['expiresIn'],
    );

    const refreshToken = jwt.sign(
      { id, type: 'refresh' },
      config.jwt.expiration.refresh as SignOptions['expiresIn'],
    );

    return { user, accessToken, refreshToken };
  },

  validate: (type: 'access' | 'refresh', token: string) => {
    if (!token) throw exception.unauthorized('NO_TOKEN_PROVIDED');
    const payload = jwt.verify(token);

    const isValid =
      typeof payload === 'object' &&
      'type' in payload &&
      'id' in payload &&
      payload.type === type;

    if (!isValid) throw exception.unauthorized('INVALID_TOKEN_PAYLOAD');

    return { id: payload.id };
  },
};
