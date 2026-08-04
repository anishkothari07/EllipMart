import { inventoryRepository } from './inventory.repository';
import { CreateInventoryMovementInput, UpdateInventoryInput, InventorySearchInput } from './inventory.dto';
import { AppError } from '@corecart/shared';
import type { Prisma } from '@prisma/client';
import { prisma } from '@corecart/database';


export class InventoryService {
  async getInventoryById(id: string) {
    const inventory = await inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }
    return inventory;
  }

  async getInventoryByVariantId(variantId: string) {
    const inventory = await inventoryRepository.findByVariantId(variantId);
    if (!inventory) {
      throw new AppError('Inventory not found for this variant', 404);
    }
    return inventory;
  }

  async updateInventory(id: string, input: UpdateInventoryInput) {
    await this.getInventoryById(id);
    return inventoryRepository.update(id, input);
  }

  async addMovement(id: string, input: CreateInventoryMovementInput) {
    await this.getInventoryById(id);
    return inventoryRepository.addMovement(id, input);
  }

  async listInventory(params: InventorySearchInput) {
    const { page, limit, status, lowStockOnly } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (lowStockOnly) {
      where.quantityAvailable = {
        lte: prisma.inventory.fields.lowStockThreshold
      };
    }

    const [total, items] = await inventoryRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { updatedAt: 'desc' }
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}

export const inventoryService = new InventoryService();
