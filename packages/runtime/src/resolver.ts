import { headers } from 'next/headers';
import { manifestRepository } from './manifest-repository';
import { RuntimeManifest } from './types';
import { prisma } from '../prisma/client';

export async function resolveActiveManifest(): Promise<RuntimeManifest> {
  let host = 'localhost';
  try {
    const headersList = await headers();
    host = headersList.get('host') || 'localhost';
  } catch (error) {
    // Graceful fallback host if header API is unavailable during static compilation steps
  }

  const manifest = await manifestRepository.getActiveManifest(host);
  if (manifest) {
    return manifest;
  }

  // Fallback: look up the first active website in the database to prevent site-wide boot crashes
  // while ensuring zero hardcoded branding values are kept in the codebase.
  const activeWebsite = await prisma.website.findFirst({
    where: { isActive: true },
    include: {
      versions: {
        where: { isLive: true },
        take: 1,
      },
    },
  });

  const activeVersion = activeWebsite?.versions[0];
  if (activeVersion) {
    try {
      return JSON.parse(activeVersion.payload) as RuntimeManifest;
    } catch (e) {
      console.error('Failed parsing fallback active version payload:', e);
    }
  }

  // Fallback 2: Look up any website version in the database
  const anyWebsite = await prisma.website.findFirst({
    include: {
      versions: {
        orderBy: { publishedAt: 'desc' },
        take: 1,
      },
    },
  });

  const fallbackVersion = anyWebsite?.versions[0];
  if (fallbackVersion) {
    try {
      return JSON.parse(fallbackVersion.payload) as RuntimeManifest;
    } catch (e) {
      console.error('Failed parsing fallback version payload:', e);
    }
  }

  throw new Error('Website Not Found: No active website matches the requested domain and no database templates exist.');
}
