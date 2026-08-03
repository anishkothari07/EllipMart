import fs from "fs/promises";
import path from "path";
import { IStorageProvider, StorageUploadOptions, StorageUploadResult } from "./storage.interface";

export class LocalStorageProvider implements IStorageProvider {
  id = "LOCAL";
  private uploadDir: string;
  private baseUrl: string;

  constructor(uploadDir?: string, baseUrl?: string) {
    this.uploadDir = uploadDir || path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
    this.baseUrl = baseUrl || "/uploads";
  }

  async upload(options: StorageUploadOptions): Promise<StorageUploadResult> {
    const subFolder = options.folderPath || "";
    const targetDir = path.join(this.uploadDir, subFolder);
    await fs.mkdir(targetDir, { recursive: true });

    const targetPath = path.join(targetDir, options.fileName);
    await fs.writeFile(targetPath, options.buffer);

    const relativeStoragePath = path.join(subFolder, options.fileName).replace(/\\/g, "/");
    const cleanRelativePath = relativeStoragePath.startsWith("/") ? relativeStoragePath : `/${relativeStoragePath}`;
    const publicUrl = `${this.baseUrl}${cleanRelativePath}`.replace(/\/+/g, "/");

    return {
      storageProvider: this.id,
      storagePath: relativeStoragePath,
      publicUrl,
      size: options.buffer.length,
    };
  }

  async delete(storagePath: string): Promise<boolean> {
    try {
      const targetPath = path.join(this.uploadDir, storagePath);
      await fs.unlink(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(storagePath: string): string {
    const cleanPath = storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${this.baseUrl}/${cleanPath}`;
  }
}
