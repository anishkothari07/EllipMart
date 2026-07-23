'use client'

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import type { CartItem, Product } from '@/lib/types'
import { products as mockProducts } from '@/lib/data'

type StoreContextValue = {
  // cart
  cart: CartItem[]
  cartCount: number
  cartSubtotal: number
  addToCart: (product: Product, opts?: { color?: string; size?: string; quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  // wishlist
  wishlist: Product[]
  wishlistCount: number
  toggleWishlist: (product: Product) => void
  isWishlisted: (productId: string) => boolean
  moveToCart: (product: Product) => void
  // cart drawer
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  // notifications
  notifications: number
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      // Assuming user is authenticated and header is handled by fetch interceptor/middleware 
      // or we rely on session
      // For this demo, let's just make a simple call. If auth is missing, it will fail gracefully.
      const res = await fetch('/api/v1/cart');
      if (res.ok) {
        const json = await res.json();
        const dbItems = json.data?.items || [];
        
        const mappedCart = dbItems.map((dbItem: any) => {
          const productId = dbItem.variant?.product?.id || '';
          let itemImages = dbItem.variant?.product?.images?.map((img: any) => img.media?.path || img.url).filter(Boolean) || [];
          
          if (itemImages.length === 0) {
            const charCode = productId ? productId.charCodeAt(0) + productId.charCodeAt(productId.length - 1) : 0;
            const mockProduct = mockProducts[charCode % mockProducts.length];
            itemImages = (mockProduct && mockProduct.images) ? [...mockProduct.images] : ['/images/p-headphones.png', '/images/p-earbuds.png'];
          }

          return {
            quantity: dbItem.quantity,
            selectedColor: dbItem.variant?.color,
            selectedSize: dbItem.variant?.size,
            product: {
              id: dbItem.variantId, // Keep this as variantId since the UI uses product.id for removals
              name: dbItem.variant?.product?.name || 'Unknown Product',
              slug: dbItem.variant?.product?.slug || 'unknown-product',
              brand: dbItem.variant?.product?.brand?.name || 'SmartGO',
              price: Number(dbItem.variant?.pricing?.sellingPrice || 0),
              currency: 'USD',
              images: itemImages,
              freeDelivery: true
            }
          }
        });
        
        setCart(mappedCart);
      }
    } catch (e) {
      console.error('Failed to fetch cart', e);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback<StoreContextValue['addToCart']>(async (product, opts) => {
    try {
      let variantId = product.id; // Fallback
      if (product.rawVariants && product.rawVariants.length > 0) {
        // Try to match color/size, or just pick the first one
        const matched = product.rawVariants.find(v => v.color === opts?.color && v.size === opts?.size);
        variantId = matched ? matched.id : product.rawVariants[0].id;
      }

      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: opts?.quantity || 1 })
      });
      if (res.ok) {
        fetchCart();
        setCartOpen(true);
      } else {
        console.error('Failed to add to cart:', await res.json());
      }
    } catch (e) {}
  }, [fetchCart])

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      await fetch(`/api/v1/cart?variantId=${productId}`, {
        method: 'DELETE'
      });
      fetchCart();
    } catch (e) {}
  }, [fetchCart])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      await fetch(`/api/v1/cart`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: productId, quantity })
      });
      fetchCart();
    } catch (e) {}
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    try {
      await fetch(`/api/v1/cart`, {
        method: 'DELETE'
      });
      fetchCart();
    } catch (e) {}
  }, [fetchCart])

  const isInCart = useCallback(
    (productId: string) => cart.some((i) => i.product.id === productId),
    [cart],
  )

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [product, ...prev],
    )
  }, [])

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist],
  )

  const moveToCart = useCallback(
    (product: Product) => {
      addToCart(product)
      setWishlist((prev) => prev.filter((p) => p.id !== product.id))
    },
    [addToCart],
  )

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart])
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [cart],
  )

  const value: StoreContextValue = {
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    wishlist,
    wishlistCount: wishlist.length,
    toggleWishlist,
    isWishlisted,
    moveToCart,
    cartOpen,
    setCartOpen,
    notifications: 3,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
