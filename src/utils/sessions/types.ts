import { UserResult } from '../../entities/user';

export interface Session {
  user: UserResult;
  accessToken: string;
  refreshToken: string;
}
