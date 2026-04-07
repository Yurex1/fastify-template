import { CreateSession, UserSession } from '../../entities/session';
import { TypedPool } from '../../infra/pg';

import { EntityRepo } from '../EntityRepo';
import { selectByToken, selectByUserId } from './sql';
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

  async removeByUserId(userId: number, deviceId: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE "userId" = $1 AND "deviceId" = $2', [userId, deviceId]);
  }

  async removeByToken(token: string, deviceId: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE "refreshToken" = $1 AND "deviceId" = $2', [token, deviceId]);
  }
}

export const init = (pool: TypedPool): SessionRepo => {
  const sessionRepo = new SessionRepository(pool);

  return {
    create: (session: CreateSession) => sessionRepo.create(session),
    findOne: (definition: Partial<UserSession>) => sessionRepo.findOne(definition),
    findByUserId: (userId: number) => sessionRepo.findByUserId(userId),
    removeByUserId: (userId: number, deviceId: string) => sessionRepo.removeByUserId(userId, deviceId),
    removeByToken: (token: string, deviceId: string) => sessionRepo.removeByToken(token, deviceId),
  };
};
