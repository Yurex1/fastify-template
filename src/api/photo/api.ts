import * as schemas from './schemas';
import { PhotoApi, Deps } from './types';

export const init = ({ s3 }: Deps): PhotoApi => ({
  'get-upload-url': {
    method: 'post',
    access: 'common',
    schema: schemas.getUploadUrl,
    handler: async (_, request) => {
      const { mediaType, expiresIn = 3600 } = request.body;

      return await s3.generateUploadUrl(mediaType, expiresIn);
    },
  },

  delete: {
    method: 'delete',
    access: 'common',
    schema: schemas.deletePhoto,
    handler: async (_, request) => {
      const { fileName } = request.query;

      await s3.deletePhoto(fileName);

      return {
        message: 'Photo deleted successfully',
      };
    },
  },
});
