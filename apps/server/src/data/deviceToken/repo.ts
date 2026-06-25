import type { TypedPool } from '../../infra/pg';
import type { DeviceToken, CreateDeviceToken } from './types';
import type { DeviceTokenRepo } from './types';

import { EntityRepo } from '../EntityRepo';

import { upsertDeviceToken, selectByUserId, deleteByUserAndDevice, deleteByToken } from './sql';

class DeviceTokenRepository extends EntityRepo<DeviceToken> {
  constructor(pool: TypedPool) {
    super(pool, 'device_tokens', ['id', 'userId', 'deviceId', 'token', 'createdAt', 'updatedAt']);
  }

  async upsert(data: CreateDeviceToken): Promise<DeviceToken> {
    const { query, params } = upsertDeviceToken(data);
    const {
      rows: [row],
    } = await this.pool.query(query, params);
    return row;
  }

  async findAllByUserId(userId: number): Promise<DeviceToken[]> {
    const { query, params } = selectByUserId(userId);
    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  async removeByUserAndDevice(userId: number, deviceId: string): Promise<void> {
    const { query, params } = deleteByUserAndDevice(userId, deviceId);
    await this.pool.query(query, params);
  }

  async removeByToken(token: string): Promise<void> {
    const { query, params } = deleteByToken(token);
    await this.pool.query(query, params);
  }
}

export const init = (pool: TypedPool): DeviceTokenRepo => {
  const repo = new DeviceTokenRepository(pool);

  return {
    upsert: (data: CreateDeviceToken) => repo.upsert(data),
    findAllByUserId: (userId: number) => repo.findAllByUserId(userId),
    removeByUserAndDevice: (userId: number, deviceId: string) => repo.removeByUserAndDevice(userId, deviceId),
    removeByToken: (token: string) => repo.removeByToken(token),
  };
};
