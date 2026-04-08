import { CreateSession, UserSession } from '../../entities/session';
import type { TypedPool } from '../../infra/pg';

import { EntityRepo } from '../EntityRepo';
import { buildUpsertQuery, removeByUserIdAndDeviceId, selectByUserId } from './sql';
import { SessionRepo } from './types';

class SessionRepository extends EntityRepo<UserSession> {
  constructor(pool: TypedPool) {
    super(pool, 'sessions', ['id', 'userId', 'refreshToken', 'deviceId', 'expiresAt', 'createdAt', 'updatedAt']);
  }
  async findOne(definition: Partial<UserSession>): Promise<UserSession | null> {
    return (await super.findOne(definition)) as UserSession | null;
  }

  async findByUserId(userId: number): Promise<UserSession | null> {
    const { query, params } = selectByUserId(userId);
    return await this.pool.queryOne<UserSession>(query, params);
  }

  async removeByUserId(userId: number, deviceId: string): Promise<UserSession | null> {
    const { query, params } = removeByUserIdAndDeviceId(userId, deviceId);
    return await this.pool.queryOne<UserSession>(query, params);
  }

  async upsert(session: CreateSession): Promise<UserSession | null> {
    const { query, params } = buildUpsertQuery(session);
    return await this.pool.queryOne<UserSession>(query, params);
  }
}

export const init = (pool: TypedPool): SessionRepo => {
  const sessionRepo = new SessionRepository(pool);

  return {
    create: (session: CreateSession) => sessionRepo.create(session),
    findOne: (definition: Partial<UserSession>) => sessionRepo.findOne(definition),
    findByUserId: (userId: number) => sessionRepo.findByUserId(userId),
    removeByUserId: (userId: number, deviceId: string) => sessionRepo.removeByUserId(userId, deviceId),
    upsert: (session: CreateSession) => sessionRepo.upsert(session),
  };
};
