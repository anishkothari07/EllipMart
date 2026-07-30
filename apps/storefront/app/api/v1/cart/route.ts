import { NextRequest } from 'next/server';
import { cartService } from '@corecart/commerce';
import { successResponse, errorResponse } from '@corecart/shared';
import { AppError } from '@corecart/shared';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const cart = await cartService.getCart(userId);
    return successResponse(cart);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const body = await req.json();
    console.log('[CART_DEBUG] POST /api/v1/cart request received');
    console.log('[CART_DEBUG] User ID:', userId);
    
    const { variantId, quantity } = body;
    console.log('[CART_DEBUG] Variant ID:', variantId);
    console.log('[CART_DEBUG] Quantity:', quantity);

    if (!variantId) throw new AppError('Variant ID is required', 400);

    const cart = await cartService.addItem(userId, variantId, quantity || 1);
    const res = successResponse(cart);
    console.log('[CART_DEBUG] Response:', JSON.stringify(cart, null, 2));
    return res;
  } catch (error: any) {
    console.log('[CART_DEBUG] Error:', error);
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const body = await req.json();
    const { variantId, quantity, action } = body;
    
    if (!variantId) throw new AppError('Variant ID is required', 400);
    
    let cart;
    if (action === 'saveForLater') {
      cart = await cartService.saveForLater(userId, variantId);
    } else if (action === 'moveToCart') {
      cart = await cartService.moveToCart(userId, variantId);
    } else if (quantity !== undefined) {
      cart = await cartService.updateItemQuantity(userId, variantId, quantity);
    } else {
      throw new AppError('Invalid action or missing quantity', 400);
    }

    return successResponse(cart);
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) throw new AppError('Unauthorized', 401);

    const url = new URL(req.url);
    const variantId = url.searchParams.get('variantId');

    if (variantId) {
      const cart = await cartService.removeItem(userId, variantId);
      return successResponse(cart);
    } else {
      await cartService.clearCart(userId, false);
      const cart = await cartService.getCart(userId);
      return successResponse(cart);
    }
  } catch (error: any) {
    if (error.isOperational) return errorResponse(error.message, error.errorCode, undefined, error.statusCode);
    return errorResponse(error.message || 'Internal Server Error', 'INTERNAL_SERVER_ERROR', undefined, 500);
  }
}
