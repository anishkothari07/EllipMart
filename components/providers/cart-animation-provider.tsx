"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/components/providers/store-provider";

interface CartAnimationContextType {
  registerCartIcon: (ref: React.RefObject<HTMLDivElement | null>) => void;
  animateAddToCart: (imageSrc: string, triggerRef: React.RefObject<HTMLElement | null>) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

interface FloatingItem {
  id: number;
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
}

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const cartIconRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(0);
  const { dispatch } = useStore();

  const registerCartIcon = (ref: React.RefObject<HTMLDivElement | null>) => {
    cartIconRef.current = ref.current;
  };

  const animateAddToCart = (imageSrc: string, triggerRef: React.RefObject<HTMLElement | null>) => {
    if (!triggerRef.current) return;

    const srcRect = triggerRef.current.getBoundingClientRect();
    let dstX = window.innerWidth - 80;
    let dstY = 40;

    if (cartIconRef.current) {
      const dstRect = cartIconRef.current.getBoundingClientRect();
      dstX = dstRect.left + dstRect.width / 2;
      dstY = dstRect.top + dstRect.height / 2;
    }

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const itemId = nextId.current++;
    const newItem: FloatingItem = {
      id: itemId,
      src: imageSrc,
      startX: srcRect.left + scrollX,
      startY: srcRect.top + scrollY,
      endX: dstX + scrollX,
      endY: dstY + scrollY,
      width: srcRect.width,
      height: srcRect.height,
    };

    setFloatingItems((prev) => [...prev, newItem]);

    // Force small bounce on cart icon after flight lands (approx 700ms)
    setTimeout(() => {
      if (cartIconRef.current) {
        cartIconRef.current.classList.remove("cart-bounce");
        void cartIconRef.current.offsetWidth; // Force reflow
        cartIconRef.current.classList.add("cart-bounce");
      }
      setFloatingItems((prev) => prev.filter((item) => item.id !== itemId));
    }, 750);
  };

  return (
    <CartAnimationContext.Provider value={{ registerCartIcon, animateAddToCart }}>
      {children}
      
      {/* Floating fly items overlay layer */}
      <div className="absolute top-0 left-0 pointer-events-none z-50">
        <AnimatePresence>
          {floatingItems.map((item) => (
            <motion.img
              key={item.id}
              src={item.src}
              initial={{
                position: "absolute",
                left: item.startX,
                top: item.startY,
                width: item.width,
                height: item.height,
                borderRadius: "12px",
                opacity: 1,
                scale: 1,
              }}
              animate={{
                left: [item.startX, (item.startX + item.endX) / 2, item.endX],
                top: [item.startY, Math.min(item.startY, item.endY) - 120, item.endY], // Curved parabolic flight path
                width: 24,
                height: 24,
                opacity: [1, 0.9, 0.2],
                scale: [1, 0.7, 0.4],
                borderRadius: "50%",
              }}
              transition={{
                duration: 0.75,
                ease: [0.25, 0.1, 0.25, 1], // Custom cubic flight ease
              }}
              style={{
                objectFit: "cover",
                boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error("useCartAnimation must be used within a CartAnimationProvider");
  }
  return context;
}
