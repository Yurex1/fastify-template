import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { LiveKitService } from './types';
import { config } from '../../config';

const getRoomService = () => new RoomServiceClient(config.livekit.url, config.livekit.apiKey, config.livekit.apiSecret);

export const init = (): LiveKitService => ({
  token: async (userName, roomName) => {
    const token = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
      identity: userName,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
    return { token: await token.toJwt() };
  },

  room: async (roomName) => {
    const svc = getRoomService();
    const room = await svc.createRoom({ name: roomName });
    return room;
  },

  delete: async (roomName) => {
    const svc = getRoomService();
    await svc.deleteRoom(roomName);
    return { success: true };
  },
});
