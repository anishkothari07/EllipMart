'use client'

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import type { CartItem, Product } from '@corecart/shared'

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
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ellipmart_wishlist')
      if (saved) {
        try {
          setWishlist(JSON.parse(saved))
        } catch (e) {}
      }
      setIsWishlistLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isWishlistLoaded && typeof window !== 'undefined') {
      localStorage.setItem('ellipmart_wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist, isWishlistLoaded])

  const fetchCart = useCallback(async () => {
    try {
      // Assuming user is authenticated and header is handled by fetch interceptor/middleware 
      // or we rely on session
      // For this demo, let's just make a simple call. If auth is missing, it will fail gracefully.
      const res = await fetch('/api/v1/cart', {
        headers: { 'x-user-id': 'mock-user-id' }
      });
      if (res.ok) {
        const json = await res.json();
        const dbItems = json.data?.items || [];
        
        const mappedCart = dbItems.map((dbItem: any) => {
          const productId = dbItem.variant?.product?.id || '';
          let itemImages = dbItem.variant?.product?.images?.map((img: any) => {
            let src = img.media?.publicUrl || img.media?.path || img.url;
            if (typeof src === 'string' && src.startsWith('/uploads/')) {
              src = `${process.env.NEXT_PUBLIC_MERCHANT_URL || 'http://localhost:3002'}${src}`;
            }
            return src;
          }).filter(Boolean) || [];
          
          if (itemImages.length === 0) {
            itemImages = ['/placeholder.jpg'];
          }

          return {
            quantity: dbItem.quantity,
            selectedColor: dbItem.variant?.color,
            selectedSize: dbItem.variant?.size,
            product: {
              id: dbItem.variantId, // Keep this as variantId since the UI uses product.id for removals
              name: dbItem.variant?.product?.name || 'Unknown Product',
              slug: dbItem.variant?.product?.slug || 'unknown-product',
              brand: dbItem.variant?.product?.brand?.name || 'EllipMart',
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

  const addToCart = useCallback<StoreContextValue['addToCart']>((product, opts) => {
    const qty = opts?.quantity || 1;
    let variantId = product.id;
    if (product.rawVariants && product.rawVariants.length > 0) {
      const matched = product.rawVariants.find(v => v.color === opts?.color && v.size === opts?.size);
      variantId = matched ? matched.id : product.rawVariants[0].id;
    }

    // 1. INSTANT (0ms) OPTIMISTIC UI UPDATE
    setCart((prev) => {
      const existingIdx = prev.findIndex(item => item.product.id === variantId || item.product.id === product.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: copy[existingIdx].quantity + qty
        };
        return copy;
      }
      return [
        ...prev,
        {
          quantity: qty,
          selectedColor: opts?.color,
          selectedSize: opts?.size,
          product: {
            ...product,
            id: variantId
          }
        }
      ];
    });

    // 2. Open cart drawer IMMEDIATELY (0ms)
    setCartOpen(true);

    // 3. Background DB Sync
    fetch('/api/v1/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'mock-user-id' },
      body: JSON.stringify({ variantId, quantity: qty })
    }).then(res => {
      if (res.ok) fetchCart();
    }).catch(() => {});
  }, [fetchCart]);

  const removeFromCart = useCallback((productId: string) => {
    // 1. INSTANT OPTIMISTIC UPDATE
    setCart(prev => prev.filter(i => i.product.id !== productId));

    // 2. Background DB Sync
    fetch(`/api/v1/cart?variantId=${productId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'mock-user-id' }
    }).then(res => {
      if (res.ok) fetchCart();
    }).catch(() => {});
  }, [fetchCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // 1. INSTANT OPTIMISTIC UPDATE
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    }));

    // 2. Background DB Sync
    fetch(`/api/v1/cart`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'mock-user-id' },
      body: JSON.stringify({ variantId: productId, quantity })
    }).then(res => {
      if (res.ok) fetchCart();
    }).catch(() => {});
  }, [fetchCart, removeFromCart]);

  const clearCart = useCallback(() => {
    // 1. INSTANT OPTIMISTIC UPDATE
    setCart([]);

    // 2. Background DB Sync
    fetch(`/api/v1/cart`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'mock-user-id' }
    }).then(res => {
      if (res.ok) fetchCart();
    }).catch(() => {});
  }, [fetchCart]);

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

  const value: StoreContextValue = useMemo(() => ({
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
  }), [
    cart, cartCount, cartSubtotal, addToCart, removeFromCart,
    updateQuantity, clearCart, isInCart, wishlist, toggleWishlist,
    isWishlisted, moveToCart, cartOpen, setCartOpen,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
