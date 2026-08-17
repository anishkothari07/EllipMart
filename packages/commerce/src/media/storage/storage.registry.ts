import { IStorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./local.storage";
import { CloudinaryStorageProvider } from "./cloudinary.storage";
import { SupabaseStorageProvider } from "./supabase.storage";

export type StorageFactory = (config?: any) => IStorageProvider;

class StorageRegistry {
  private factories: Map<string, StorageFactory> = new Map();
  private defaultProviderId: string = "SUPABASE";

  constructor() {
    this.register("LOCAL", (config) => new LocalStorageProvider(config?.uploadDir, config?.baseUrl));
    this.register("CLOUDINARY", () => new CloudinaryStorageProvider());
    this.register("SUPABASE", () => new SupabaseStorageProvider());
  }

  register(id: string, factory: StorageFactory) {
    this.factories.set(id, factory);
  }

  resolve(id?: string, config?: any): IStorageProvider {
    const providerId = (id || process.env.STORAGE_PROVIDER || (process.env.NEXT_PUBLIC_SUPABASE_URL ? "SUPABASE" : this.defaultProviderId)).toUpperCase();
    const factory = this.factories.get(providerId);
    if (!factory) {
      return this.factories.get("SUPABASE")?.(config) || this.factories.get("LOCAL")!(config);
    }
    return factory(config);
  }

  getRegisteredProviders(): string[] {
    return Array.from(this.factories.keys());
  }
}

export const storageRegistry = new StorageRegistry();
