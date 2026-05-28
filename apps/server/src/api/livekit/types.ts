import { API, ProtectedEndpoint } from '../types';
import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';
import { LiveKitService } from '../../services/livekit/types';

type TokenParam = SchemaType.FromSchema<typeof schemas.token>;
type RoomParam = SchemaType.FromSchema<typeof schemas.room>;

export interface LiveKitApi extends API {
  token: ProtectedEndpoint<TokenParam, { token: string }>;
  room: ProtectedEndpoint<RoomParam, any>;
  'room/delete': ProtectedEndpoint<RoomParam, { success: boolean }>;
}

export interface Deps {
  liveKitService: LiveKitService;
}
