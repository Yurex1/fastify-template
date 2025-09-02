import * as schemas from './schemas';
import { PhotoApi, Deps } from './types';

export const init = ({ s3 }: Deps): PhotoApi => ({
  upload: {
    method: 'post',
    access: 'common',
    schema: schemas.uploadPhoto,
    handler: async (_, request) => {
      const { file, fileName, contentType } = request.body;

      let fileBuffer: Buffer;
      if (typeof file === 'string') {
        fileBuffer = Buffer.from(file, 'base64');
      } else if (Buffer.isBuffer(file)) {
        fileBuffer = file;
      } else {
        throw new Error('Invalid file format');
      }

      const maxSize = 10 * 1024 * 1024;
      if (fileBuffer.length > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
      }

      const uploadedFileName = await s3.uploadPhoto(fileBuffer, fileName, contentType);
      const photoUrl = s3.getPhotoUrl(uploadedFileName);

      return {
        success: true,
        fileName: uploadedFileName,
        url: photoUrl,
        size: fileBuffer.length,
        contentType,
        uploadedAt: new Date().toISOString(),
      };
    },
  },

  delete: {
    method: 'delete',
    access: 'common',
    schema: schemas.deletePhoto,
    handler: async (_, request) => {
      const { fileName } = request.body;

      await s3.deletePhoto(fileName);

      return {
        success: true,
        message: 'Photo deleted successfully',
      };
    },
  },

  url: {
    method: 'get',
    access: 'common',
    schema: schemas.getPhotoUrl,
    handler: async (_, request) => {
      const { fileName } = request.query;
      const { signed = 'false' } = request.query;

      let url: string;
      if (signed === 'true') {
        url = await s3.getSignedUrl(fileName, 3600);
      } else {
        url = s3.getPhotoUrl(fileName);
      }

      return {
        success: true,
        url,
        fileName,
      };
    },
  },
});
