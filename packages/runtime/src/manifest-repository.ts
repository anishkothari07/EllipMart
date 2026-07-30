import { prisma } from '../prisma/client';
import { RuntimeManifest } from './types';
import { validateAndCompileManifest } from './compiler';

export interface ManifestRepository {
  getActiveManifest(host: string): Promise<RuntimeManifest | null>;
  getDraftManifest(host: string): Promise<RuntimeManifest | null>;
}

export class PrismaManifestRepository implements ManifestRepository {
  async getActiveManifest(host: string): Promise<RuntimeManifest | null> {
    const normalizedHost = this.normalizeHost(host);
    const website = await prisma.website.findUnique({
      where: { domain: normalizedHost },
      include: {
        versions: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!website) return null;

    // Use activeVersionId if present, otherwise fall back to versions list
    let activeVersion = null;
    if (website.activeVersionId) {
      activeVersion = website.versions.find((v) => v.id === website.activeVersionId);
    }
    if (!activeVersion) {
      activeVersion = website.versions.find((v) => v.isLive);
    }
    if (!activeVersion) return null;

    try {
      return JSON.parse(activeVersion.payload) as RuntimeManifest;
    } catch (e) {
      console.error('Failed to parse published manifest JSON payload:', e);
      return null;
    }
  }

  async getDraftManifest(host: string): Promise<RuntimeManifest | null> {
    const normalizedHost = this.normalizeHost(host);
    const website = await prisma.website.findUnique({
      where: { domain: normalizedHost },
    });

    if (!website) return null;

    try {
      const compiled = await validateAndCompileManifest(website.id);
      return compiled.manifest;
    } catch (e) {
      console.error('Failed to compile draft manifest dynamically:', e);
      return null;
    }
  }

  private normalizeHost(host: string): string {
    return host.split(':')[0].toLowerCase();
  }
}

export const manifestRepository: ManifestRepository = new PrismaManifestRepository();
