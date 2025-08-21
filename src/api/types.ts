import { UserApi } from './user/types';
import { AuthApi } from './auth/types';
import { FastifyRequest } from 'fastify';
import { Api } from './healthCheck/types';
import { UserResult } from '../entities/user';

export type AccessType = 'none' | 'common' | 'refresh';

export interface Endpoint<
  Params,
  Result,
  Access extends AccessType,
  SessionGeneric extends {} | null,
> {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  access: Access;
  params?: string[];
  customType?: string;
  schema: { properties: object; [key: string]: any };
  handler: (session: SessionGeneric, params: FastifyRequest & Params) => Result;
}

export type ProtectedEndpoint<Params, Result> = Endpoint<
  Params,
  Result,
  'common' | 'refresh',
  UserResult
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

export interface APIs extends Record<string, API> {
  api: Api;
  user: UserApi;
  auth: AuthApi;
}
