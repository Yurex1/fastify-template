import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
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

  async uploadPhoto(file: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `photos/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

      const uploadParams: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: file,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          fileSize: file.length.toString(),
        },
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      return uniqueFileName;
    } catch (error) {
      throw new Error(`Failed to upload photo: ${error}`);
    }
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

  async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
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
}

export const init = (): S3Service => {
  return new AWSS3Service();
};
