import { DeviceTokenRepo } from '../../data/deviceToken/types';
import { DeviceToken } from '../../entities/deviceToken';
import { FirebaseConfigs } from '../../firebase/notification/types';

export interface DeviceTokenService {
  register: (userId: number, deviceId: string, token: string) => Promise<DeviceToken>;
  unregister: (userId: number, deviceId: string) => Promise<void>;
  getFirebaseConfigs: () => Promise<FirebaseConfigs>;
}

export interface Deps {
  deviceTokenRepo: DeviceTokenRepo;
}
