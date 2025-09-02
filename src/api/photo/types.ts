import { S3Service } from '../../services/s3/types';
import type { ProtectedEndpoint, API } from '../types';
import * as schemas from './schemas';
import * as SchemaType from 'json-schema-to-ts';

type UploadPhotoParams = SchemaType.FromSchema<typeof schemas.uploadPhoto>;
type DeletePhotoParams = SchemaType.FromSchema<typeof schemas.deletePhoto>;
type GetPhotoUrlParams = SchemaType.FromSchema<typeof schemas.getPhotoUrl>;

type UploadPhotoResponse = {
  success: boolean;
  fileName: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
};
type DeletePhotoResponse = {
  success: boolean;
  message: string;
};

type GetPhotoUrlResponse = {
  success: boolean;
  url: string;
  fileName: string;
};

export interface Deps {
  s3: S3Service;
}

export interface PhotoApi extends API {
  upload: ProtectedEndpoint<UploadPhotoParams, Promise<UploadPhotoResponse>>;
  delete: ProtectedEndpoint<DeletePhotoParams, Promise<DeletePhotoResponse>>;
  url: ProtectedEndpoint<GetPhotoUrlParams, Promise<GetPhotoUrlResponse>>;
}
