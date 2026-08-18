'use server';

import { requireAdminAccess, getCurrentUser } from '@corecart/shared/src/auth';
import { prisma } from '@corecart/database';
import { authService } from '@corecart/commerce';
import { cookies } from 'next/headers';

// ── Admin Auth Actions (used by seller-auth-provider.tsx for the admin portal) ──

export async function getSellerSessionAction() {
  try {
    const user = await getCurrentUser('admin');
    if (!user || user.role !== 'ADMIN') return null;
    return user;
  } catch {
    return null;
  }
}

export async function sellerLoginAction(payload: { email: string; password: string }) {
  try {
    const result = await authService.login(payload, {});

    if (result.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access only.');
    }

    const cookieStore = await cookies();
    cookieStore.set('ellipmart_session', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true, user: result.user };
  } catch (e: any) {
    return { success: false, error: e.message || 'Invalid credentials' };
  }
}

export async function sellerLogoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('ellipmart_session');
    cookieStore.delete('ellipmart_admin_refresh');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchAdminDashboardAction() {
  try {
    await requireAdminAccess();

    const [
      totalSellers,
      totalCustomers,
      totalProducts,
      totalOrders,
      recentOrders,
      revenueResult,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          grandTotal: true,
          status: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.order.aggregate({ _sum: { grandTotal: true } }),
    ]);

    return {
      success: true,
      data: {
        totalSellers,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(revenueResult._sum.grandTotal || 0),
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load dashboard' };
  }
}

export async function fetchSellersAction(params?: {
  page?: number;
  search?: string;
  status?: string;
}) {
  try {
    await requireAdminAccess();

    const page = params?.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { role: 'SELLER' };
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
          _count: { select: { sellerProducts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        sellers: JSON.parse(JSON.stringify(sellers)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch sellers' };
  }
}

export async function updateSellerStatusAction(sellerId: string, status: 'ACTIVE' | 'SUSPENDED') {
  try {
    await requireAdminAccess();
    await prisma.user.update({
      where: { id: sellerId },
      data: { status },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update seller status' };
  }
}

export async function createSellerAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  try {
    await requireAdminAccess();

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const result = await authService.register({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      phone: input.phone,
    });

    // Promote to SELLER role and set ACTIVE immediately (admin-created accounts skip email verification)
    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: 'SELLER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });

    return { success: true, data: { id: result.user.id, email: result.user.email } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create seller account' };
  }
}


export async function fetchCustomersAction(params?: {
  page?: number;
  search?: string;
}) {
  try {
    await requireAdminAccess();

    const page = params?.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { role: 'CUSTOMER' };
    if (params?.search) {
      where.OR = [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        customers: JSON.parse(JSON.stringify(customers)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customers' };
  }
}

export async function fetchAdminOrdersAction(params?: {
  page?: number;
  search?: string;
  status?: string;
}) {
  try {
    await requireAdminAccess();

    const page = params?.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { orderNumber: { contains: params.search } },
        { user: { email: { contains: params.search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          grandTotal: true,
          status: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, email: true } },
          payment: { select: { status: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: {
        orders: JSON.parse(JSON.stringify(orders)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch orders' };
  }
}

export async function fetchAdminCategoriesAction() {
  try {
    await requireAdminAccess();
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true, children: true } },
        parent: { select: { id: true, name: true } },
      },
    });
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch categories' };
  }
}
