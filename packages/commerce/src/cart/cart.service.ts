import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';

export const cartService = {
  async getCart(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 401);

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { 
                    images: { include: { media: true } },
                    brand: true,
                    category: true
                  }
                },
                pricing: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { 
                      images: { include: { media: true } },
                      brand: true,
                      category: true
                    }
                  },
                  pricing: true
                }
              }
            }
          }
        }
      });
    }

    const activeItems = cart.items.filter(item => !item.isSaved);
    const savedItems = cart.items.filter(item => item.isSaved);

    return {
      ...cart,
      items: activeItems,
      savedItems: savedItems
    };
  },

  async addItem(userId: string, variantId: string, quantity: number = 1) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    console.log('[CART_DEBUG] Existing cart found?', !!cart);
    if (!cart) {
      console.log('[CART_DEBUG] Creating new cart...');
      await this.getCart(userId); // ensure cart exists
      return this.addItem(userId, variantId, quantity);
    }
    console.log('[CART_DEBUG] Cart ID:', cart.id);

    let variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true }
    });

    if (!variant) {
      variant = await prisma.productVariant.findFirst({
        where: { productId: variantId, isActive: true },
        include: { inventory: true }
      });
      if (variant) {
        variantId = variant.id;
      }
    }

    if (!variant || !variant.isActive) {
      throw new AppError('Variant not found or inactive', 404);
    }

    const availableStock = variant.inventory ? variant.inventory.quantityAvailable - variant.inventory.quantityReserved : 0;
    
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId }
      }
    });
    console.log('[CART_DEBUG] Existing item found?', !!existingItem);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      console.log('[CART_DEBUG] Updating quantity from', existingItem.quantity, 'to', newQuantity);
      if (newQuantity > availableStock) {
        throw new AppError(`Only ${availableStock} items available in stock`, 400);
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, isSaved: false }
      });
    } else {
      console.log('[CART_DEBUG] Creating new item...');
      if (quantity > availableStock) {
        throw new AppError(`Only ${availableStock} items available in stock`, 400);
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
          isSaved: false
        }
      });
    }

    return this.getCart(userId);
  },

  async updateItemQuantity(userId: string, variantId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    if (quantity <= 0) {
      return this.removeItem(userId, variantId);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true }
    });

    const availableStock = variant?.inventory ? variant.inventory.quantityAvailable - variant.inventory.quantityReserved : 0;
    if (quantity > availableStock) {
      throw new AppError(`Only ${availableStock} items available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { quantity }
    });

    return this.getCart(userId);
  },

  async removeItem(userId: string, variantId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    try {
      await prisma.cartItem.delete({
        where: { cartId_variantId: { cartId: cart.id, variantId } }
      });
    } catch (e) {
      // ignore if not found
    }

    return this.getCart(userId);
  },

  async saveForLater(userId: string, variantId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    await prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { isSaved: true }
    });

    return this.getCart(userId);
  },

  async moveToCart(userId: string, variantId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    // Should we validate stock here? Let's check stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true }
    });
    
    const availableStock = variant?.inventory ? variant.inventory.quantityAvailable - variant.inventory.quantityReserved : 0;
    const item = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } }
    });

    if (item && item.quantity > availableStock) {
      throw new AppError(`Only ${availableStock} items available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { isSaved: false }
    });

    return this.getCart(userId);
  },

  async clearCart(userId: string, includeSaved: boolean = false) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    if (includeSaved) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, isSaved: false }
      });
    }
  }
};
