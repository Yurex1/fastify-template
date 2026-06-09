import { Session } from '../../utils/sessions/types';
import type { SessionRepo } from '../../data/session/types';
import type { UserRepo } from '../../data/user/types';
import type { User, UserResult } from '../../entities/user';

export interface AuthService {
  signIn: (usernameOrEmail: string, password: string, deviceId: string, lang: string) => Promise<Session>;
  signUp: (email: string, username: string, password: string, deviceId: string, lang: string) => Promise<Session>;
  signOut: (userId: number, deviceId: string, lang: string) => Promise<{ signedOut: boolean }>;
  verify: (access: 'access' | 'refresh', token: string) => Promise<UserResult>;
  refresh: (userId: number, deviceId: string, refreshToken: string) => Promise<Session>;
  changePassword: (userId: number, oldPassword: string, newPassword: string, lang: string) => Promise<User>;
  signInWithGoogle: (googleId: string, email: string, name: string, deviceId: string) => Promise<Session>;
}

export interface Deps {
  userRepo: UserRepo;
  sessionRepo: SessionRepo;
}
