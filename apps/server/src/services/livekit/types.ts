import { Room } from 'livekit-server-sdk';
import { UserResult } from '../../entities/user';

export interface LiveKitService {
  token: (user: UserResult, roomName: string) => Promise<{ token: string }>;
  room: (roomName: string) => Promise<Room>;
  delete: (roomName: string) => Promise<{ success: boolean }>;
}
