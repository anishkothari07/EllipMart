import { prisma } from '@corecart/database';
import { UserStatus } from '@prisma/client';
import { AppError } from '@corecart/shared';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  segment?: string; // VIP, Wholesale, New, Inactive, etc.
  tag?: string;
  status?: string;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CustomerListResult {
  items: CustomerSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  lastOrderDate: string | null;
  customerSince: string;
  status: string;
  tags: string[];
}

export interface CustomerDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  customerSince: string;
  stats: {
    totalOrders: number;
    totalSpend: number;
    avgOrderValue: number;
    lastPurchaseDate: string | null;
  };
  tags: string[];
  notes: CustomerNote[];
  activities: CustomerActivity[];
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
}

export interface CustomerNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CustomerActivity {
  id: string;
  type: string; // ACCOUNT_CREATED, ORDER_PLACED, ORDER_CANCELLED, REFUND_ISSUED, ADDRESS_UPDATED, LOGIN
  message: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  company: string | null;
  street: string;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string; // HOME, OFFICE, OTHER
  isBilling: boolean;
  isShipping: boolean;
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string | null;
  grandTotal: number;
}

// ─────────────────────────────────────────────
// Helpers to process savedPreferences (JSON)
// ─────────────────────────────────────────────

function parseCRMPreferences(savedPreferences: string | null) {
  try {
    if (!savedPreferences) return { tags: [], notes: [], activities: [] };
    const parsed = JSON.parse(savedPreferences);
    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    };
  } catch {
    return { tags: [], notes: [], activities: [] };
  }
}

// ─────────────────────────────────────────────
// Service Impl
// ─────────────────────────────────────────────

export const customerMerchantService = {

  // ── Customer List ───────────────────────────

  async listCustomers(params: CustomerListParams): Promise<CustomerListResult> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    // Fetch all customers with orders and addresses to compute stats in JS,
    // or filter down database users where role = 'CUSTOMER'.
    const where: any = {
      role: 'CUSTOMER',
    };

    if (params.status) {
      where.status = params.status as UserStatus;
    }

    if (params.search) {
      where.OR = [
        { id: { contains: params.search } },
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    // Execute query
    const rawUsers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { payment: true },
        },
        addresses: true,
      },
    });

    // Map each customer and compute statistical metrics
    let items: CustomerSummary[] = rawUsers.map((user) => {
      const crmPrefs = parseCRMPreferences(user.savedPreferences);
      
      const orders = user.orders || [];
      const totalOrders = orders.length;
      
      // Spend is computed from captured payments or confirmed/shipped/delivered orders
      const totalSpend = orders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + Number(o.grandTotal), 0);
      
      const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
      const lastOrderDate = orders[0]?.createdAt.toISOString() ?? null;

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        totalOrders,
        totalSpend,
        avgOrderValue,
        lastOrderDate,
        customerSince: user.createdAt.toISOString(),
        status: user.status,
        tags: crmPrefs.tags,
      };
    });

    // Handle Client-side filter segmenting
    if (params.tag) {
      items = items.filter((item) => item.tags.includes(params.tag!));
    }

    if (params.segment) {
      const now = new Date();
      items = items.filter((item) => {
        switch (params.segment) {
          case 'VIP':
            return item.totalSpend >= 10000;
          case 'WHOLESALE':
            return item.tags.includes('Wholesale');
          case 'NEW':
            const created = new Date(item.customerSince);
            const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
            return diffDays <= 30;
          case 'RETURNING':
            return item.totalOrders > 1;
          case 'HIGH_SPEND':
            return item.totalSpend >= 25000;
          case 'INACTIVE':
            if (!item.lastOrderDate) return true;
            const last = new Date(item.lastOrderDate);
            const diffInactiveDays = (now.getTime() - last.getTime()) / (1000 * 3600 * 24);
            return diffInactiveDays >= 90;
          default:
            return true;
        }
      });
    }

    // Handle Sorting
    const sortField = params.sortField ?? 'customerSince';
    const sortDir = params.sortDir ?? 'desc';

    items.sort((a, b) => {
      let valA: any = a[sortField as keyof CustomerSummary];
      let valB: any = b[sortField as keyof CustomerSummary];

      // fallback handling for nulls
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Customer Profile ────────────────────────

  async getCustomerProfile(userId: string): Promise<CustomerDetail> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { payment: true },
        },
      },
    });

    if (!user) throw new AppError('Customer not found', 404);

    const crmPrefs = parseCRMPreferences(user.savedPreferences);
    const orders = user.orders || [];
    const totalOrders = orders.length;
    const totalSpend = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.grandTotal), 0);
    
    const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
    const lastPurchaseDate = orders[0]?.createdAt.toISOString() ?? null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatarUrl: null, // can expand if avatar media exists
      status: user.status,
      customerSince: user.createdAt.toISOString(),
      stats: {
        totalOrders,
        totalSpend,
        avgOrderValue,
        lastPurchaseDate,
      },
      tags: crmPrefs.tags,
      notes: crmPrefs.notes,
      activities: crmPrefs.activities.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      addresses: user.addresses.map((addr) => ({
        id: addr.id,
        fullName: addr.fullName,
        phone: addr.phone,
        company: addr.company,
        street: addr.street,
        landmark: addr.landmark,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        addressType: addr.addressType,
        isBilling: addr.isBilling,
        isShipping: addr.isShipping,
        isDefault: addr.isDefault,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        paymentStatus: o.payment?.status ?? null,
        grandTotal: Number(o.grandTotal),
      })),
    };
  },

  // ── CRM Updates: Tags, Notes, Timeline ───────

  async updateCustomerTags(userId: string, tags: string[]) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Customer not found', 404);

    const crmPrefs = parseCRMPreferences(user.savedPreferences);
    const prevTags = crmPrefs.tags;
    crmPrefs.tags = tags;

    // Log tag updates in activities
    const added = tags.filter((t: string) => !prevTags.includes(t));
    const removed = prevTags.filter((t: string) => !tags.includes(t));
    let msg = '';
    if (added.length > 0) msg += `Tags added: ${added.join(', ')}. `;
    if (removed.length > 0) msg += `Tags removed: ${removed.join(', ')}. `;

    if (msg) {
      crmPrefs.activities.push({
        id: Math.random().toString(36).substring(7),
        type: 'TAG_UPDATED',
        message: msg.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    return prisma.user.update({
      where: { id: userId },
      data: { savedPreferences: JSON.stringify(crmPrefs) },
    });
  },

  async addCustomerNote(userId: string, content: string, author: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Customer not found', 404);

    const crmPrefs = parseCRMPreferences(user.savedPreferences);
    const noteId = Math.random().toString(36).substring(7);

    crmPrefs.notes.push({
      id: noteId,
      content,
      createdBy: author,
      createdAt: new Date().toISOString(),
    });

    crmPrefs.activities.push({
      id: Math.random().toString(36).substring(7),
      type: 'NOTE_ADDED',
      message: `Note added by ${author}: "${content.substring(0, 30)}..."`,
      createdAt: new Date().toISOString(),
    });

    await prisma.user.update({
      where: { id: userId },
      data: { savedPreferences: JSON.stringify(crmPrefs) },
    });

    return {
      id: noteId,
      content,
      createdBy: author,
      createdAt: new Date().toISOString(),
    };
  },

  async addActivity(userId: string, type: string, message: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Customer not found', 404);

    const crmPrefs = parseCRMPreferences(user.savedPreferences);
    crmPrefs.activities.push({
      id: Math.random().toString(36).substring(7),
      type,
      message,
      createdAt: new Date().toISOString(),
    });

    return prisma.user.update({
      where: { id: userId },
      data: { savedPreferences: JSON.stringify(crmPrefs) },
    });
  },

  // ── Address Operations ───────────────────────

  async createAddress(userId: string, addressData: any) {
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const addr = await prisma.address.create({
      data: {
        userId,
        fullName: addressData.fullName,
        phone: addressData.phone,
        company: addressData.company || null,
        street: addressData.street,
        landmark: addressData.landmark || null,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        addressType: addressData.addressType || 'HOME',
        isBilling: addressData.isBilling ?? false,
        isShipping: addressData.isShipping ?? true,
        isDefault: addressData.isDefault ?? false,
      },
    });

    await this.addActivity(userId, 'ADDRESS_UPDATED', `Added new address: ${addr.street}, ${addr.city}`);
    return addr;
  },

  async updateAddress(userId: string, addressId: string, addressData: any) {
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const addr = await prisma.address.update({
      where: { id: addressId, userId },
      data: addressData,
    });

    await this.addActivity(userId, 'ADDRESS_UPDATED', `Updated address: ${addr.street}, ${addr.city}`);
    return addr;
  },

  async deleteAddress(userId: string, addressId: string) {
    const addr = await prisma.address.delete({
      where: { id: addressId, userId },
    });
    await this.addActivity(userId, 'ADDRESS_UPDATED', `Deleted address: ${addr.street}`);
    return { success: true };
  },

  async setDefaultAddress(userId: string, addressId: string) {
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId, userId },
        data: { isDefault: true },
      }),
    ]);

    await this.addActivity(userId, 'ADDRESS_UPDATED', 'Set default address.');
    return { success: true };
  },

  // ── Bulk status action ───────────────────────

  async bulkUpdateStatus(userIds: string[], status: UserStatus) {
    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { status },
    });

    for (const userId of userIds) {
      await this.addActivity(userId, 'ACCOUNT_UPDATED', `Account status updated to ${status}`);
    }

    return { updated: userIds.length };
  },
};
