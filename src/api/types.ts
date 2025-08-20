import { Api } from './healthCheck/types';

export type AccessType = 'none' | 'common' | 'refresh';

export interface Endpoint<
  Params,
  Result,
  Access extends 'none' | 'common' | 'refresh',
  SessionGeneric extends {} | null,
> {
  method: 'get' | 'post' | 'put' | 'delete';
  access: Access;
  params?: string[];
  schema: { properties: object; [key: string]: any };
  handler: (session: SessionGeneric, params: Params) => Result;
}

export type ProtectedEndpoint<Params, Result> = Endpoint<
  Params,
  Result,
  'common' | 'refresh',
  { id: number }
>;

export type UnprotectedEndpoint<Params, Result> = Endpoint<
  Params,
  Result,
  'none',
  null
>;

export interface API {
  [key: string]: Endpoint<any, any, AccessType, any>;
}

import { UserApi } from './user/types';
import { AuthApi } from './auth/types';

export interface APIs extends Record<string, API> {
  api: Api;
  user: UserApi;
  auth: AuthApi;
}
