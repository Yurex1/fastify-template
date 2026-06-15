import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schema';
import type { ProtectedEndpoint, API } from '../types';
import { DeviceTokenService } from '../../services/deviceToken/types';

type RegisterParam = SchemaType.FromSchema<typeof schemas.register>;
type UnregisterParam = SchemaType.FromSchema<typeof schemas.unregister>;

export interface DeviceTokenApi extends API {
  register: ProtectedEndpoint<RegisterParam, { ok: boolean }>;
  unregister: ProtectedEndpoint<UnregisterParam, { ok: boolean }>;
}

export interface Deps {
  deviceTokenService: DeviceTokenService;
}
