export interface S3Service {
  uploadPhoto: (file: Buffer, fileName: string, contentType: string) => Promise<string>;
  deletePhoto: (fileName: string) => Promise<void>;
  getSignedUrl: (fileName: string, expiresIn?: number) => Promise<string>;
  getPhotoUrl: (fileName: string) => string;
}

export interface UploadResult {
  fileName: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

export interface PhotoMetadata {
  originalName: string;
  uploadedAt: string;
  fileSize: string;
}

