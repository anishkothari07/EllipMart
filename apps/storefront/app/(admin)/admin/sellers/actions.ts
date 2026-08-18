'use server';

import { prisma } from '@corecart/database';
import { requireAdminAccess } from '@corecart/shared/src/auth';

export async function fetchSellersAction() {
  try {
    await requireAdminAccess();
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            sellerProducts: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: JSON.parse(JSON.stringify(sellers)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch sellers' };
  }
}
