import type { TypedPool } from '../../infra/pg';
import type { CreateSession, UserSession } from '../../entities/session';

export interface SessionRepo {
  create: (session: CreateSession) => Promise<UserSession>;
  findOne: (definition: Partial<UserSession>) => Promise<UserSession | null>;
  findOneByUserId: (userId: number) => Promise<UserSession | null>;
  removeByUserIdAndDeviceId: (userId: number, deviceId: string) => Promise<UserSession | null>;
  upsert: (session: CreateSession) => Promise<UserSession | null>;
}

export type init = (pg: TypedPool) => SessionRepo;
