'use server';

import { requireSellerAccess } from '@corecart/shared/src/auth';
import { prisma } from '@corecart/database';

export async function fetchSellerDashboardOverviewAction() {
  try {
    const user = await requireSellerAccess();
    
    // Fetch product counts specific to the seller
    const totalProducts = await prisma.product.count({
      where: { sellerId: user.id, deletedAt: null }
    });
    
    const activeProducts = await prisma.product.count({
      where: { sellerId: user.id, status: 'ACTIVE', deletedAt: null }
    });

    const draftProducts = await prisma.product.count({
      where: { sellerId: user.id, status: 'DRAFT', deletedAt: null }
    });

    // We can add Orders stats later when orders are linked to sellers.
    
    return {
      success: true,
      data: {
        productsCount: totalProducts,
        productsActive: activeProducts,
        productsDraft: draftProducts,
        revenue: 0, // Placeholder
        ordersCount: 0 // Placeholder
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load dashboard overview' };
  }
}
