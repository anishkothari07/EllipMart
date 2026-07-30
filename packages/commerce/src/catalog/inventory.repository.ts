import { Prisma } from '@prisma/client';
import { prisma } from '@corecart/database';

export class InventoryRepository {
  async findById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
      include: {
        variant: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async findByVariantId(variantId: string) {
    return prisma.inventory.findUnique({
      where: { variantId },
    });
  }

  async update(id: string, data: Prisma.InventoryUpdateInput) {
    return prisma.inventory.update({
      where: { id },
      data,
    });
  }

  async addMovement(inventoryId: string, data: Omit<Prisma.InventoryMovementCreateInput, 'inventory'>) {
    return prisma.$transaction(async (tx) => {
      // Create movement
      const movement = await tx.inventoryMovement.create({
        data: {
          ...data,
          inventory: { connect: { id: inventoryId } }
        }
      });

      // Update inventory totals based on movement type
      // Simplified logic: Adjustments just set the quantity
      // Purchases/Sales add/subtract
      // Real implementations would be more robust
      const inv = await tx.inventory.findUnique({ where: { id: inventoryId } });
      if (!inv) throw new Error('Inventory not found');

      let { quantityAvailable, quantityReserved } = inv;
      const q = movement.quantity;

      switch (movement.type) {
        case 'PURCHASE':
        case 'RETURN':
          quantityAvailable += q;
          break;
        case 'SALE':
        case 'DAMAGE':
          quantityAvailable -= Math.abs(q); // ensure subtraction
          break;
        case 'RESERVATION':
          quantityAvailable -= Math.abs(q);
          quantityReserved += Math.abs(q);
          break;
        case 'ADJUSTMENT':
          quantityAvailable += q; // q can be negative or positive
          break;
      }

      // Update inventory with new totals
      const updatedInv = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantityAvailable,
          quantityReserved,
          status: quantityAvailable > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        }
      });

      return { movement, inventory: updatedInv };
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InventoryWhereInput;
    orderBy?: Prisma.InventoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          variant: {
            include: { product: true }
          }
        },
      }),
    ]);
  }
}

export const inventoryRepository = new InventoryRepository();
