import type { DeviceTokenService, Deps } from './types';

export const init = ({ deviceTokenRepo }: Deps): DeviceTokenService => ({
  register: async (userId, deviceId, token) => {
    return deviceTokenRepo.upsert({ userId, deviceId, token });
  },
  unregister: async (userId, deviceId) => {
    return deviceTokenRepo.removeByUserAndDevice(userId, deviceId);
  },
});
