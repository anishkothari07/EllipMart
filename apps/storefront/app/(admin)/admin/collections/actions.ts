'use server';

import { requireAdminAccess } from '@corecart/shared/src/auth';
import { prisma } from '@corecart/database';

export async function fetchCollectionsAction() {
  try {
    await requireAdminAccess();
    const collections = await prisma.collection.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return { success: true, data: JSON.parse(JSON.stringify(collections)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch collections' };
  }
}
