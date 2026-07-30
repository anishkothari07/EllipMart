import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';
import { Prisma } from '@prisma/client';

export interface MerchantInventoryItem {
  id: string;
  variantId: string;
  sku: string;
  barcode: string | null;
  variantName: string;
  productName: string;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER' | 'DISCONTINUED';
}

export class MerchantInventoryService {
  static async listMerchantInventory(params: {
    page?: number;
    limit?: number;
    search?: string;
    lowStockOnly?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {
      variant: {
        deletedAt: null,
      },
    };

    if (params.search) {
      where.variant = {
        OR: [
          { sku: { contains: params.search } },
          { name: { contains: params.search } },
          { product: { name: { contains: params.search } } },
        ],
        deletedAt: null,
      };
    }

    if (params.lowStockOnly) {
      // Quantity available is less than or equal to safety thresholds
      where.quantityAvailable = {
        lte: prisma.inventory.fields.lowStockThreshold,
      };
    }

    const [total, items] = await prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    const mapped: MerchantInventoryItem[] = items.map((inv) => {
      const quantity = inv.quantityAvailable;
      const threshold = inv.lowStockThreshold;
      
      let derivedStatus: MerchantInventoryItem['status'] = 'IN_STOCK';
      if (quantity === 0) {
        derivedStatus = 'OUT_OF_STOCK';
      } else if (quantity <= threshold) {
        derivedStatus = 'LOW_STOCK';
      }

      return {
        id: inv.id,
        variantId: inv.variantId,
        sku: inv.variant.sku,
        barcode: inv.variant.barcode,
        variantName: inv.variant.name,
        productName: inv.variant.product.name,
        quantityAvailable: inv.quantityAvailable,
        quantityReserved: inv.quantityReserved,
        lowStockThreshold: inv.lowStockThreshold,
        status: derivedStatus,
      };
    });

    return { items: mapped, total };
  }

  static async adjustVariantInventory(variantId: string, input: {
    adjustType: 'INCREASE' | 'DECREASE' | 'SET';
    quantity: number;
    reason: 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'OTHER';
    notes?: string;
    lowStockThreshold?: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({
        where: { variantId },
      });
      if (!inv) throw new AppError('Inventory not found for this variant', 404);

      let prevQty = inv.quantityAvailable;
      let newQty = prevQty;

      if (input.adjustType === 'INCREASE') {
        newQty = prevQty + input.quantity;
      } else if (input.adjustType === 'DECREASE') {
        newQty = Math.max(0, prevQty - input.quantity);
      } else if (input.adjustType === 'SET') {
        newQty = input.quantity;
      }

      // Log movement history log
      const qtyDiff = newQty - prevQty;
      await tx.inventoryMovement.create({
        data: {
          inventoryId: inv.id,
          quantity: qtyDiff,
          type: input.reason,
          // Store notes and previous/new stock values in notes string
          // until schema gets a proper notes column. We'll stringify audits.
          notes: JSON.stringify({
            source: 'Merchant', // Audit source as requested
            notes: input.notes || 'Manual stock correction',
            prevQty,
            newQty,
          }),
        },
      });

      // Update inventory Available qty
      return tx.inventory.update({
        where: { variantId },
        data: {
          quantityAvailable: newQty,
          status: newQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
          lowStockThreshold: input.lowStockThreshold !== undefined ? input.lowStockThreshold : inv.lowStockThreshold,
        },
      });
    });
  }

  static async getInventoryHistory(variantId: string) {
    const inv = await prisma.inventory.findUnique({
      where: { variantId },
    });
    if (!inv) throw new AppError('Inventory not found for variant', 404);

    const movements = await prisma.inventoryMovement.findMany({
      where: { inventoryId: inv.id },
      orderBy: { createdAt: 'desc' },
    });

    return movements.map((m) => {
      let audit = { source: 'Merchant', notes: '', prevQty: 0, newQty: 0 };
      try {
        if (m.description) {
          audit = JSON.parse(m.description);
        }
      } catch (e) {
        // Fallback for raw descriptions
        audit.notes = m.description || '';
      }

      return {
        id: m.id,
        createdAt: m.createdAt,
        quantity: m.quantity,
        type: m.type, // "PURCHASE", "ADJUSTMENT", etc.
        source: audit.source,
        notes: audit.notes,
        prevQty: audit.prevQty,
        newQty: audit.newQty,
      };
    });
  }
}
