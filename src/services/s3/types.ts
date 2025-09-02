export interface S3Service {
  deletePhoto: (fileName: string) => Promise<void>;
  getSignedUrl: (path: string, expiresIn?: number) => Promise<string>;
  getPhotoUrl: (fileName: string) => string;
  generateUploadUrl: (mediaType: string, expiresIn?: number) => Promise<{
    uploadUrl: string;
    finalUrl: string;
    fileName: string;
    expiresIn: number;
    mediaType: string;
  }>;
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
  uploadedAt: Date;
  fileSize: number;
}
