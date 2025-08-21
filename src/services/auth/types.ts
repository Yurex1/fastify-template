import type { UserRepo } from '../../data/user/types';
import type { User, UserResult } from '../../entities/user';
import { Session } from '../../utils/sessions/types';

export interface AuthService {
  signIn: (usernameOrEmail: string, password: string) => Promise<Session>;
  signUp: (
    email: string,
    username: string,
    password: string,
  ) => Promise<Session>;
  signOut: (userId: number) => Promise<{ signedOut: boolean }>;
  verify: (
    access: 'common' | 'refresh',
    authHeaders?: string,
  ) => Promise<UserResult>;
  refresh: (userId: number) => Promise<Session>;
  changePassword: (
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) => Promise<User>;
}

export interface Deps {
  userRepo: UserRepo;
}
