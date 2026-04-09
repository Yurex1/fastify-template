import { UserApi } from './user/types';
import { AuthApi } from './auth/types';
import { PhotoApi } from './photo/types';
import { PostApi } from './post/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Api } from './healthCheck/types';
import { UserResult } from '../entities/user';

export type AccessType = 'none' | 'access' | 'refresh';

export interface Endpoint<Params, Result, Access extends AccessType, SessionGeneric extends unknown | null> {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  access: Access;
  params?: string[];
  customType?: string;
  schema: { properties: object; [key: string]: unknown };
  handler: (session: SessionGeneric, request: FastifyRequest & Params, reply: FastifyReply) => Promise<Result>;
}

export type ProtectedEndpoint<Params, Result> = Endpoint<Params, Result, 'access' | 'refresh', UserResult>;

export type UnprotectedEndpoint<Params, Result> = Endpoint<Params, Result, 'none', null>;

export interface API {
  [key: string]: Endpoint<any, any, AccessType, any>;
}

export interface APIs extends Record<string, API> {
  api: Api;
  user: UserApi;
  auth: AuthApi;
  photo: PhotoApi;
  post: PostApi;
}
