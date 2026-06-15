import { DeviceTokenRepo } from '../../data/deviceToken/types';
import { DeviceToken } from '../../entities/deviceToken';

export interface DeviceTokenService {
  register: (userId: number, deviceId: string, token: string) => Promise<DeviceToken>;
  unregister: (userId: number, deviceId: string) => Promise<void>;
}

export interface Deps {
  deviceTokenRepo: DeviceTokenRepo;
}
