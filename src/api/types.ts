import { Api } from './api/types';

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
  {}
>;

export type UnprotectedEndpoint<Params, Result> = Endpoint<
  Params,
  Result,
  'none',
  null
>;

export interface API {
  [key: string]: Endpoint<any, any, any, any>;
}

export interface APIs extends Record<string, API> {
  api: Api;
}
