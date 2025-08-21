import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';
import type { User } from '../../entities/user';
import type { AuthService } from '../../services/auth/types';
import type { ProtectedEndpoint, UnprotectedEndpoint, API } from '../types';
import { Session } from '../../utils/sessions/types';

type SignInParam = SchemaType.FromSchema<typeof schemas.signIn>;
type SignUpParam = SchemaType.FromSchema<typeof schemas.signUp>;
type SignOutParam = SchemaType.FromSchema<typeof schemas.signOut>;
type RefreshParam = SchemaType.FromSchema<typeof schemas.refresh>;
type ChangePasswordParam = SchemaType.FromSchema<typeof schemas.changePassword>;

export interface AuthApi extends API {
  'sign-in': UnprotectedEndpoint<SignInParam, Promise<Session>>;
  'sign-up': UnprotectedEndpoint<SignUpParam, Promise<Session>>;
  'sign-out': ProtectedEndpoint<SignOutParam, Promise<{ signedOut: boolean }>>;
  refresh: ProtectedEndpoint<RefreshParam, Promise<Session>>;
  'change-password': ProtectedEndpoint<ChangePasswordParam, Promise<User>>;
}

export interface Deps {
  authService: AuthService;
}
