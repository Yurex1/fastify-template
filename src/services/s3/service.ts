import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config';
import { S3Service } from './types';

class AWSS3Service implements S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = config.aws.region;
    this.bucketName = config.aws.bucketName;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  async deletePhoto(fileName: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: fileName,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete photo: ${error}`);
    }
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  getPhotoUrl(fileName: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
  }

  async generateUploadUrl(
    mediaType: string,
    expiresIn: number = 3600,
  ): Promise<{
    uploadUrl: string;
    finalUrl: string;
    fileName: string;
    expiresIn: number;
    mediaType: string;
  }> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mediaType)) {
      throw new Error('Invalid media type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    const timestamp = Date.now();
    const fileExtension = mediaType.split('/')[1];
    const uniqueFileName = `photos/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

    const uploadUrl = await this.getSignedUrl(uniqueFileName, expiresIn);
    const finalUrl = this.getPhotoUrl(uniqueFileName);

    return {
      uploadUrl,
      finalUrl,
      fileName: uniqueFileName,
      expiresIn,
      mediaType,
    };
  }
}

export const init = (): S3Service => {
  return new AWSS3Service();
};
