import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';
import type { User, UserResult } from '../../entities/user';
import type { AuthService } from '../../services/auth/types';
import type { ProtectedEndpoint, UnprotectedEndpoint, API } from '../types';
import type { Session } from '../../utils/sessions/types';

type SignInParam = SchemaType.FromSchema<typeof schemas.signIn>;
type SignUpParam = SchemaType.FromSchema<typeof schemas.signUp>;
type SignOutParam = SchemaType.FromSchema<typeof schemas.signOut>;
type RefreshParam = SchemaType.FromSchema<typeof schemas.refresh>;
type ChangePasswordParam = SchemaType.FromSchema<typeof schemas.changePassword>;

export interface AuthApi extends API {
  'sign-in': UnprotectedEndpoint<SignInParam, Partial<Session>>;
  'sign-up': UnprotectedEndpoint<SignUpParam, Partial<Session>>;
  'sign-out': ProtectedEndpoint<SignOutParam, { signedOut: boolean }>;
  refresh: ProtectedEndpoint<RefreshParam, { accessToken: string; user: UserResult }>;
  'change-password': ProtectedEndpoint<ChangePasswordParam, User>;
  // google: UnprotectedEndpoint<Record<string, unknown>, void>;
}

export interface Deps {
  authService: AuthService;
}
