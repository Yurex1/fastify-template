import { S3Service } from '../../services/s3/types';
import type { ProtectedEndpoint, API } from '../types';
import * as schemas from './schemas';
import * as SchemaType from 'json-schema-to-ts';

type DeletePhotoParams = SchemaType.FromSchema<typeof schemas.deletePhoto>;
type GetUploadUrlParams = SchemaType.FromSchema<typeof schemas.getUploadUrl>;

type DeletePhotoResponse = {
  message: string;
};

type GetPhotoUrlResponse = {
  uploadUrl: string;
  finalUrl: string;
  fileName: string;
  expiresIn: number;
  mediaType: string;
};

export interface Deps {
  s3: S3Service;
}

export interface PhotoApi extends API {
  'get-upload-url': ProtectedEndpoint<GetUploadUrlParams, Promise<GetPhotoUrlResponse>>;
  delete: ProtectedEndpoint<DeletePhotoParams, Promise<DeletePhotoResponse>>;
}
