import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';
import { Service } from '../../services/service/types';
import { API, UnprotectedEndpoint } from '../types';

type HealthCheckParam = SchemaType.FromSchema<typeof schemas.healthCheck>;

export interface Api extends API {
  'health-check': UnprotectedEndpoint<HealthCheckParam, { message: string }>;
}

export interface Deps {
  service: Service;
}
