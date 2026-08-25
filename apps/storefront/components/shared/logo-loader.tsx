'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

interface LogoLoaderProps {
  className?: string
  /** Used by the one-shot splash screen to enforce a minimum display time */
  minDuration?: number
  /** Called when the loader has fully faded out */
  onDone?: () => void
}

/**
 * EllipMart branded loading state replacement.
 *
 * - Transparent backdrop — only the animated logo is visible.
 * - Uses Framer Motion for a smooth breathe + soft glow.
 * - Used in Next.js `loading.tsx` or as a direct replacement for spinners.
 */
export function LogoLoader({ 
  className = "flex min-h-[60vh] w-full items-center justify-center",
  minDuration = 0,
  onDone
}: LogoLoaderProps) {
  const [exiting, setExiting] = useState(false)
  const minRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (minDuration > 0) {
      minRef.current = setTimeout(() => {
        setExiting(true)
      }, minDuration)
    }
    return () => {
      if (minRef.current) clearTimeout(minRef.current)
    }
  }, [minDuration])

  return (
    <AnimatePresence onExitComplete={() => onDone?.()}>
      {!exiting && (
        <motion.div
          key="logo-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <div
            className={className}
            aria-label="Loading..."
            role="status"
          >
            <div className="relative flex items-center justify-center">
              {/* Pulsing Ripple Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.8, 2.5],
                  opacity: [0.6, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }}
                className="absolute rounded-full bg-primary/30"
                style={{ width: 100, height: 100 }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.6, 2],
                  opacity: [0.4, 0.1, 0],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                  repeat: Infinity,
                  delay: 0.6,
                  repeatDelay: 0.2,
                }}
                className="absolute rounded-full bg-primary/20"
                style={{ width: 100, height: 100 }}
              />

              {/* The Logo itself */}
              <motion.div
                animate={{
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.9, 1, 0.9],
                  filter: [
                    'drop-shadow(0 0 0px transparent)',
                    'drop-shadow(0 0 20px rgba(var(--primary), 0.3))',
                    'drop-shadow(0 0 0px transparent)',
                  ],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
                className="relative z-10 flex items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="EllipMart Loading"
                  width={160}
                  height={160}
                  priority
                  className="object-contain"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * One-shot wrapper: renders the loader on top of the app, and removes it
 * from the DOM once the minimum duration passes. 
 * Use this in the root layout to ensure the user sees the splash screen at least once.
 */
export function AppLogoLoader() {
  const [show, setShow] = useState(true)
  
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-[9999] bg-background pointer-events-none flex items-center justify-center">
      <LogoLoader 
        className="" 
        minDuration={1800} 
        onDone={() => setShow(false)} 
      />
    </div>
  )
}
