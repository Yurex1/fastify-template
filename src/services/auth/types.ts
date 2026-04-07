import { SessionRepo } from '../../data/session/types';
import type { UserRepo } from '../../data/user/types';
import type { User, UserResult } from '../../entities/user';
import type { Session } from '../../utils/sessions/types';

export interface AuthService {
  signIn: (usernameOrEmail: string, password: string, deviceId: string) => Promise<Session>;
  signUp: (email: string, username: string, password: string, deviceId: string) => Promise<Session>;
  signOut: (userId: number, deviceId: string) => Promise<{ signedOut: boolean }>;
  verify: (access: 'common' | 'refresh', authHeaders?: string) => Promise<UserResult>;
  refresh: (userId: number, deviceId: string, currentToken: string) => Promise<Session>;
  changePassword: (userId: number, oldPassword: string, newPassword: string) => Promise<User>;
}

export interface Deps {
  userRepo: UserRepo;
  sessionRepo: SessionRepo;
}
