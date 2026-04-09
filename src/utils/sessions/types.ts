import { UserResult } from '../../entities/user';

export interface Session {
  user: UserResult;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface SessionResponse {
  user: UserResult;
  accessToken: string;
  expiresAt: Date;
}
