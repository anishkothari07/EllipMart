'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Expand, X, Rotate3d, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@corecart/shared'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false })
  const [fullscreen, setFullscreen] = useState(false)
  const [doubleZoom, setDoubleZoom] = useState(false)
  const lastTapRef = useRef<number>(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, on: true })
  }

  const handleDragEnd = (event: any, info: any) => {
    if (images.length <= 1) return
    const threshold = 50
    if (info.offset.x < -threshold) {
      setActive((prev) => (prev + 1) % images.length)
      import('@corecart/shared/src/analytics/mobile-analytics').then(({ mobileAnalytics }) => {
        mobileAnalytics.trackSwipe('left', 'ProductGallery')
      })
    } else if (info.offset.x > threshold) {
      setActive((prev) => (prev - 1 + images.length) % images.length)
      import('@corecart/shared/src/analytics/mobile-analytics').then(({ mobileAnalytics }) => {
        mobileAnalytics.trackSwipe('right', 'ProductGallery')
      })
    }
  }

  const handleTap = () => {
    const now = Date.now()
    const DOUBLE_PRESS_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      setDoubleZoom((dz) => !dz)
    } else {
      lastTapRef.current = now
    }
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col overflow-x-auto no-scrollbar py-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i)
                setDoubleZoom(false)
              }}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-card transition-colors sm:size-20',
                i === active ? 'border-foreground' : 'border-transparent hover:border-border',
              )}
            >
              <Image src={img || '/placeholder.svg'} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image Container */}
      <div className="relative flex-1">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          onClick={handleTap}
          onMouseMove={handleMove}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-card shadow-soft"
        >
          <Image
            src={images[active] || '/placeholder.svg'}
            alt={name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover transition-transform duration-300"
            style={
              doubleZoom
                ? { transform: 'scale(2.2)', transformOrigin: 'center' }
                : zoom.on
                ? { transform: 'scale(1.6)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
          
          {/* AR & 3D buttons inside gallery */}
          <div className="absolute left-4 bottom-4 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                alert('Launching 360° Augmented Reality Viewer...')
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass text-xs font-semibold text-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
            >
              <Rotate3d className="size-3.5" /> View in AR
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                alert('Playing product highlight video clip...')
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass text-xs font-semibold text-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
            >
              <PlayCircle className="size-3.5" /> Video
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setFullscreen(true)
            }}
            aria-label="View fullscreen"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full glass text-foreground opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100 shadow-soft"
          >
            <Expand className="size-4" />
          </button>
        </motion.div>
        
        {/* Swiping indicator dot indicators for mobile */}
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-4 bg-foreground' : 'w-1.5 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-foreground/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreen(false)}
          >
            <button
              aria-label="Close fullscreen"
              className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-background/10 text-background backdrop-blur shadow-md hover:bg-background/20"
            >
              <X className="size-5" />
            </button>
            <motion.div
              className="relative aspect-square w-full max-w-3xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[active] || '/placeholder.svg'}
                alt={name}
                fill
                sizes="768px"
                className="rounded-2xl object-contain"
              />
            </motion.div>
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActive(i)
                    }}
                    aria-label={`Image ${i + 1}`}
                    className={cn(
                      'size-2 rounded-full transition-colors',
                      i === active ? 'bg-background' : 'bg-background/40',
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
