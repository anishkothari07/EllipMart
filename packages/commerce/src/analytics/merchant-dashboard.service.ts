import { prisma } from '@corecart/database';

export interface DashboardKPIs {
  revenue: number;
  salesGrowth: number; // percentage
  ordersCount: number;
  ordersGrowth: number;
  productsCount: number;
  productsActive: number;
  customersCount: number;
  customersNew: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'ORDER' | 'CUSTOMER' | 'PRODUCT' | 'SYSTEM';
  title: string;
  description: string;
  time: string;
  status?: string;
}

export interface LowStockWidgetData {
  lowStockCount: number;
  outOfStockCount: number;
  items: {
    sku: string;
    productName: string;
    variantName: string;
    quantityAvailable: number;
    lowStockThreshold: number;
  }[];
}

export class MerchantDashboardService {
  static async getDashboardOverview(): Promise<{
    kpis: DashboardKPIs;
    recentActivity: RecentActivityItem[];
  }> {
    // This is initially mocked for Sprint 1 foundation but structured for dynamic DB query hooks in Sprint 2.
    return {
      kpis: {
        revenue: 124890.5,
        salesGrowth: 12.8,
        ordersCount: 384,
        ordersGrowth: 8.3,
        productsCount: 48,
        productsActive: 42,
        customersCount: 1205,
        customersNew: 94,
      },
      recentActivity: [
        {
          id: 'act-1',
          type: 'ORDER',
          title: 'Order #3842 placed',
          description: 'Aavya Sharma purchased 3 items for ₹3,499.00',
          time: '5 mins ago',
          status: 'success',
        },
        {
          id: 'act-2',
          type: 'CUSTOMER',
          title: 'New customer registration',
          description: 'Kabir Verma registered using email kabir.v@example.com',
          time: '24 mins ago',
        },
        {
          id: 'act-3',
          type: 'ORDER',
          title: 'Order #3841 paid',
          description: 'Payment verified for ₹1,899.00 by HDFC NetBanking',
          time: '1 hour ago',
          status: 'success',
        },
        {
          id: 'act-4',
          type: 'PRODUCT',
          title: 'Stock alert: Wireless Headphones',
          description: 'Variant Matte Black fell below safety threshold (2 remaining)',
          time: '2 hours ago',
          status: 'warning',
        },
        {
          id: 'act-5',
          type: 'SYSTEM',
          title: 'Store version published',
          description: 'Active Version v1 published successfully by System Scheduler',
          time: '4 hours ago',
        },
      ],
    };
  }

  static async getDashboardWidgets(): Promise<LowStockWidgetData> {
    // 1. Calculate Out of Stock count
    const outOfStockCount = await prisma.inventory.count({
      where: {
        quantityAvailable: 0,
        variant: { deletedAt: null },
      },
    });

    // 2. Calculate Low Stock count
    // Uses quantityAvailable <= lowStockThreshold and quantityAvailable > 0
    const lowStockCount = await prisma.inventory.count({
      where: {
        quantityAvailable: {
          gt: 0,
          lte: prisma.inventory.fields.lowStockThreshold,
        },
        variant: { deletedAt: null },
      },
    });

    // 3. Retrieve actual items list (take top 5)
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantityAvailable: {
          lte: prisma.inventory.fields.lowStockThreshold,
        },
        variant: { deletedAt: null },
      },
      take: 5,
      orderBy: { quantityAvailable: 'asc' },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    const items = lowStockItems.map((inv) => ({
      sku: inv.variant.sku,
      productName: inv.variant.product.name,
      variantName: inv.variant.name,
      quantityAvailable: inv.quantityAvailable,
      lowStockThreshold: inv.lowStockThreshold,
    }));

    return {
      lowStockCount,
      outOfStockCount,
      items,
    };
  }
}
