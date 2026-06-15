import type { BaseEntity } from '../EntityRepo';

export interface DeviceToken extends BaseEntity {
  id: number;
  userId: number;
  deviceId: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDeviceToken = Pick<DeviceToken, 'userId' | 'deviceId' | 'token'>;

export type DeviceTokenRepo = {
  upsert: (data: CreateDeviceToken) => Promise<DeviceToken>;
  findAllByUserId: (userId: number) => Promise<DeviceToken[]>;
  removeByUserAndDevice: (userId: number, deviceId: string) => Promise<void>;
  removeByToken: (token: string) => Promise<void>;
};
