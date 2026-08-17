export type CDNProviderType = 'LOCAL' | 'CLOUDFRONT' | 'CLOUDFLARE' | 'BUNNY' | 'CLOUDINARY' | 'SUPABASE';

export interface CDNConfig {
  provider: CDNProviderType;
  baseUrl: string;
  enabled: boolean;
}

class CDNProviderRegistry {
  private provider: CDNProviderType;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.provider = (process.env.CDN_PROVIDER as CDNProviderType) || (process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SUPABASE' : 'LOCAL');
    this.baseUrl = process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.enabled = !!this.baseUrl && process.env.CDN_ENABLED !== 'false';
  }

  public resolveUrl(
    pathOrKey: string,
    options?: { width?: number; height?: number; quality?: number; format?: 'webp' | 'avif' | 'png' }
  ): string {
    if (!pathOrKey) return '/placeholder.svg';

    // If path is already absolute URL (e.g. https://...), return as-is
    if (pathOrKey.startsWith('http://') || pathOrKey.startsWith('https://')) {
      return pathOrKey;
    }

    const cleanPath = pathOrKey.startsWith('/') ? pathOrKey : `/${pathOrKey}`;

    if (!this.enabled || !this.baseUrl) {
      return cleanPath;
    }

    const cdnBase = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;

    // Provider specific URL transformation parameters
    switch (this.provider) {
      case 'SUPABASE': {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
        const params: string[] = [];
        if (options?.width) params.push(`width=${options.width}`);
        if (options?.height) params.push(`height=${options.height}`);
        if (options?.quality) params.push(`quality=${options.quality}`);
        if (options?.format) params.push(`format=${options.format}`);
        const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
        const cleanRelPath = cleanPath.replace(/^\/+/, '');
        return `${cdnBase}/storage/v1/render/image/public/${bucket}/${cleanRelPath}${queryStr}`;
      }

      case 'CLOUDFRONT':
        return `${cdnBase}${cleanPath}`;

      case 'CLOUDFLARE': {
        const params: string[] = [];
        if (options?.width) params.push(`width=${options.width}`);
        if (options?.format) params.push(`format=${options.format}`);
        const paramStr = params.length > 0 ? `/cdn-cgi/image/${params.join(',')}` : '';
        return `${cdnBase}${paramStr}${cleanPath}`;
      }

      case 'CLOUDINARY': {
        const transforms: string[] = [];
        if (options?.width) transforms.push(`w_${options.width}`);
        if (options?.quality) transforms.push(`q_${options.quality}`);
        if (options?.format) transforms.push(`f_${options.format}`);
        const transformStr = transforms.length > 0 ? `/${transforms.join(',')}` : '';
        return `${cdnBase}${transformStr}${cleanPath}`;
      }

      case 'BUNNY':
      default:
        return `${cdnBase}${cleanPath}`;
    }
  }

  public generateSignedUrl(pathOrKey: string, ttlSeconds = 3600): string {
    const rawUrl = this.resolveUrl(pathOrKey);
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    // Append expiration token parameter for signed URLs
    return `${rawUrl}?expires=${expires}&signature=sig_${expires}`;
  }

  public getProviderStatus() {
    return {
      current: this.provider,
      baseUrl: this.baseUrl || 'Serves local files directly',
      cdnEnabled: this.enabled,
    };
  }
}

export const cdnRegistry = new CDNProviderRegistry();
