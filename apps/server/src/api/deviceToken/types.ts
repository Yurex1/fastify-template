import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schema';
import type { ProtectedEndpoint, API } from '../types';
import { DeviceTokenService } from '../../services/deviceToken/types';
import { FirebaseConfigs } from '../../firebase/notification/types';
import { DeviceTokenResponse } from '../../entities/deviceToken';

type RegisterParam = SchemaType.FromSchema<typeof schemas.register>;
type UnregisterParam = SchemaType.FromSchema<typeof schemas.unregister>;
type FirebaseConfigsParam = SchemaType.FromSchema<typeof schemas.firebaseConfigs>;

export interface DeviceTokenApi extends API {
  register: ProtectedEndpoint<RegisterParam, DeviceTokenResponse>;
  unregister: ProtectedEndpoint<UnregisterParam, DeviceTokenResponse>;
  'firebase-configs': ProtectedEndpoint<FirebaseConfigsParam, FirebaseConfigs>;
}

export interface Deps {
  deviceTokenService: DeviceTokenService;
}
