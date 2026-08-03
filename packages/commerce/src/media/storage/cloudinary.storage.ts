import crypto from 'crypto';
import { IStorageProvider, StorageUploadOptions, StorageUploadResult } from "./storage.interface";

export class CloudinaryStorageProvider implements IStorageProvider {
  id = "CLOUDINARY";
  private cloudName: string;
  private apiKey?: string;
  private apiSecret?: string;
  private uploadPreset?: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;
    this.uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  }

  async upload(options: StorageUploadOptions): Promise<StorageUploadResult> {
    if (!this.cloudName) {
      throw new Error("CLOUDINARY_CLOUD_NAME environment variable is not configured");
    }

    const formData = new FormData();
    const fileBlob = new Blob([options.buffer], { type: options.mimeType });
    formData.append("file", fileBlob, options.fileName);

    const folder = options.folderPath || "uploads";
    formData.append("folder", folder);

    if (this.apiKey && this.apiSecret) {
      // Production path: Secure signed upload
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = {
        folder,
        timestamp,
      };
      
      const signature = this.generateSignature(paramsToSign, this.apiSecret);
      formData.append("api_key", this.apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
    } else if (this.uploadPreset) {
      // Development fallback: Unsigned upload using preset
      formData.append("upload_preset", this.uploadPreset);
    } else {
      throw new Error("Cloudinary configuration incomplete. Set either API Key/Secret (Signed) or Upload Preset (Unsigned).");
    }

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      storageProvider: this.id,
      storagePath: data.public_id,
      publicUrl: data.secure_url,
      size: data.bytes || options.buffer.length,
    };
  }

  async delete(storagePath: string): Promise<boolean> {
    // If path is a full URL of an external or local resource, skip Cloudinary destroy call
    if (storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("/")) {
      return true;
    }

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      console.warn("[Cloudinary] Signed credentials not fully set. Skipping destroy call.");
      return false;
    }

    try {
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = {
        public_id: storagePath,
        timestamp,
      };
      const signature = this.generateSignature(paramsToSign, this.apiSecret);

      const formData = new FormData();
      formData.append("public_id", storagePath);
      formData.append("api_key", this.apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      return result.result === "ok";
    } catch (e) {
      console.error("[Cloudinary] Destroy request failed:", e);
      return false;
    }
  }

  getUrl(storagePath: string): string {
    if (storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("/")) {
      return storagePath;
    }
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${storagePath}`;
  }

  private generateSignature(params: Record<string, string | number>, apiSecret: string): string {
    const sortedKeys = Object.keys(params).sort();
    const serialized = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return crypto
      .createHash('sha1')
      .update(serialized + apiSecret)
      .digest('hex');
  }
}
