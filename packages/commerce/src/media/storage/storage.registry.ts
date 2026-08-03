import { IStorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./local.storage";
import { CloudinaryStorageProvider } from "./cloudinary.storage";

export type StorageFactory = (config?: any) => IStorageProvider;

class StorageRegistry {
  private factories: Map<string, StorageFactory> = new Map();
  private defaultProviderId: string = "LOCAL";

  constructor() {
    // Register default LocalStorageProvider
    this.register("LOCAL", (config) => new LocalStorageProvider(config?.uploadDir, config?.baseUrl));
    this.register("CLOUDINARY", () => new CloudinaryStorageProvider());
  }

  register(id: string, factory: StorageFactory) {
    this.factories.set(id, factory);
  }

  resolve(id?: string, config?: any): IStorageProvider {
    const providerId = (id || process.env.STORAGE_PROVIDER || this.defaultProviderId).toUpperCase();
    const factory = this.factories.get(providerId);
    if (!factory) {
      return this.factories.get("LOCAL")!(config);
    }
    return factory(config);
  }

  getRegisteredProviders(): string[] {
    return Array.from(this.factories.keys());
  }
}

export const storageRegistry = new StorageRegistry();
