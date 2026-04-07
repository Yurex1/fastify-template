import type { TypedPool } from '../../infra/pg';
import { CreateSession, UserSession } from '../../entities/session';

export interface SessionRepo {
  create: (session: CreateSession) => Promise<UserSession>;
  findOne: (definition: Partial<UserSession>) => Promise<UserSession | null>;
  findByUserId: (userId: number) => Promise<UserSession | null>;
  removeByUserId: (userId: number, deviceId: string) => Promise<UserSession | null>;
  upsert: (session: CreateSession) => Promise<UserSession | null>;
}

export type init = (pg: TypedPool) => SessionRepo;
