export interface StorageUploadOptions {
  fileName: string;
  folderPath?: string;
  mimeType: string;
  buffer: Buffer;
}

export interface StorageUploadResult {
  storageProvider: string; // "LOCAL", "AWS_S3", "CLOUDINARY", "R2"
  storagePath: string;
  publicUrl: string;
  size: number;
}

export interface IStorageProvider {
  id: string; // "LOCAL", "AWS_S3", "CLOUDINARY", "R2"
  upload(options: StorageUploadOptions): Promise<StorageUploadResult>;
  delete(storagePath: string): Promise<boolean>;
  getUrl(storagePath: string): string;
  getSignedUrl?(storagePath: string, expiresInSeconds?: number): Promise<string>;
}
