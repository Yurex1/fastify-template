import type { BaseEntity, CreateEntity } from '../data/EntityRepo';

export interface UserSession extends BaseEntity {
  userId: number;
  refreshToken: string;
  deviceId: string;
  expiresAt: Date;
}

export type CreateSession = CreateEntity<UserSession>;
export interface UpdateSession extends Partial<CreateSession> {}
