import * as schemas from './schema';
import type { DeviceTokenApi, Deps } from './types';

export const init = ({ deviceTokenService }: Deps): DeviceTokenApi => ({
  register: {
    method: 'post',
    access: 'access',
    schema: schemas.register,
    handler: async (user, request) => {
      const { token } = request.body;
      const { deviceId } = request;

      await deviceTokenService.register(user.id, deviceId, token);

      return { ok: true };
    },
  },

  unregister: {
    method: 'delete',
    access: 'access',
    schema: schemas.unregister,
    handler: async (user, request) => {
      await deviceTokenService.unregister(user.id, request.deviceId);

      return { ok: true };
    },
  },
});
