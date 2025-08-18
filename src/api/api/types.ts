import * as SchemaType from 'json-schema-to-ts';
import type { API, UnprotectedEndpoint } from '../types.d.ts';
import * as schemas from './schemas';
import { Service } from '../../services/service/types.js';

type HealthCheckParam = SchemaType.FromSchema<typeof schemas.healthCheck>;

export interface Api extends API {
  'health-check': UnprotectedEndpoint<HealthCheckParam, { message: string }>;
}

export interface Deps {
  service: Service;
}
