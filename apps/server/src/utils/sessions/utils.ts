import type { SignOptions } from 'jsonwebtoken';
import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../config';
import type { UserResult } from '../../entities/user';
import { exception } from '../exception/util';
import { jwt } from './jwt';
import type { Session } from './types';

export const sessions = {
  generate: (user: UserResult): Session => {
    const { id } = user;
    const accessToken = jwt.sign({ id, type: 'access' }, config.jwt.expiration.access as SignOptions['expiresIn']);

    const sanitizedUser: UserResult = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastseen: user.lastseen,
      ...(user.googleId && { googleId: user.googleId }),
    };

    const refreshToken = jwt.sign({ id, type: 'refresh' }, config.jwt.expiration.refresh as SignOptions['expiresIn']);
    const decoded = jsonwebtoken.decode(refreshToken) as { exp: number };
    if (!decoded || typeof decoded === 'string' || !decoded.exp) {
      throw exception.serverError('FAILED_TO_DECODE_TOKEN_EXPIRATION');
    }

    const expiresAt = new Date(decoded.exp * 1000);

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
      expiresAt,
    };
  },

  validate: (type: 'access' | 'refresh', token: string) => {
    if (!token) throw exception.unauthorized('NO_TOKEN_PROVIDED');
    const payload = jwt.verify(token);

    const isValid = typeof payload === 'object' && 'type' in payload && 'id' in payload && payload.type === type;

    if (!isValid) throw exception.unauthorized('INVALID_TOKEN_PAYLOAD');

    return { id: payload.id };
  },
  toSessionResponse: (session: Session): Partial<Session> => {
    return {
      user: session.user,
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    };
  },
};
