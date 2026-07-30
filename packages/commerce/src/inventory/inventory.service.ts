import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';

export const inventoryService = {
  async reserve(variantId: string, quantity: number, referenceId: string, notes?: string) {
    return await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { variantId } });
      if (!inventory) throw new AppError('Inventory not found', 404);

      const available = inventory.quantityAvailable - inventory.quantityReserved;
      if (available < quantity) {
        throw new AppError(`Insufficient stock. Only ${available} available.`, 400);
      }

      const updated = await tx.inventory.update({
        where: { variantId },
        data: { quantityReserved: { increment: quantity } }
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          quantity,
          type: 'RESERVE',
          referenceId,
          notes
        }
      });

      return updated;
    });
  },

  async release(variantId: string, quantity: number, referenceId: string, notes?: string) {
    return await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { variantId } });
      if (!inventory) throw new AppError('Inventory not found', 404);

      let releaseQty = quantity;
      if (inventory.quantityReserved < quantity) {
        releaseQty = inventory.quantityReserved; // Can't release more than reserved
      }

      if (releaseQty <= 0) return inventory;

      const updated = await tx.inventory.update({
        where: { variantId },
        data: { quantityReserved: { decrement: releaseQty } }
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          quantity: releaseQty,
          type: 'RELEASE',
          referenceId,
          notes
        }
      });

      return updated;
    });
  },

  async sale(variantId: string, quantity: number, referenceId: string, notes?: string) {
    return await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { variantId } });
      if (!inventory) throw new AppError('Inventory not found', 404);

      // Sale happens after reserve, so we decrement both available and reserved
      const updated = await tx.inventory.update({
        where: { variantId },
        data: {
          quantityAvailable: { decrement: quantity },
          quantityReserved: { decrement: Math.min(quantity, inventory.quantityReserved) } // Ensure it doesn't go below 0
        }
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          quantity,
          type: 'SALE',
          referenceId,
          notes
        }
      });

      return updated;
    });
  }
};
