import { IStorageProvider, StorageUploadOptions, StorageUploadResult } from "./storage.interface";

export class SupabaseStorageProvider implements IStorageProvider {
  id = "SUPABASE";
  private supabaseUrl: string;
  private apiKey: string;
  private bucket: string;

  constructor() {
    this.supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
    this.apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  }

  async upload(options: StorageUploadOptions): Promise<StorageUploadResult> {
    if (!this.supabaseUrl || !this.apiKey) {
      throw new Error("Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).");
    }

    const folder = options.folderPath ? options.folderPath.replace(/^\/+|\/+$/g, '') : 'uploads';
    const cleanFileName = options.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folder}/${Date.now()}-${cleanFileName}`;

    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${storagePath}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "apikey": this.apiKey,
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": options.mimeType || "application/octet-stream",
        "x-upsert": "true",
      },
      body: options.buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase Storage upload failed (${response.status}): ${response.statusText} - ${errorText}`);
    }

    const publicUrl = this.getUrl(storagePath);

    return {
      storageProvider: this.id,
      storagePath,
      publicUrl,
      size: options.buffer.length,
    };
  }

  async delete(storagePath: string): Promise<boolean> {
    if (!this.supabaseUrl || !this.apiKey) {
      console.warn("[Supabase Storage] Credentials not configured. Skipping delete.");
      return false;
    }

    // Strip full URLs if passed
    let cleanPath = storagePath;
    const publicPrefix = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/`;
    if (cleanPath.startsWith(publicPrefix)) {
      cleanPath = cleanPath.replace(publicPrefix, "");
    }

    try {
      const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}`;
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "apikey": this.apiKey,
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: [cleanPath] }),
      });

      return response.ok;
    } catch (e) {
      console.error("[Supabase Storage] Delete failed:", e);
      return false;
    }
  }

  getUrl(storagePath: string): string {
    if (storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("/")) {
      return storagePath;
    }
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${storagePath}`;
  }
}
