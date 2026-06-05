import * as schemas from './schemas';
import { LiveKitApi, Deps } from './types';

export const init = ({ liveKitService }: Deps): LiveKitApi => ({
  token: {
    method: 'post',
    access: 'access',
    schema: schemas.token,
    handler: async (user, request) => {
      const { roomName } = request.body;
      return await liveKitService.token(user, roomName);
    },
  },

  room: {
    method: 'post',
    access: 'access',
    schema: schemas.room,
    handler: async (_user, request) => {
      const { roomName } = request.body;
      return await liveKitService.room(roomName);
    },
  },

  'room/delete': {
    method: 'post',
    access: 'access',
    schema: schemas.room,
    handler: async (_user, request) => {
      const { roomName } = request.body;
      return await liveKitService.delete(roomName);
    },
  },
});
