'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function AnnouncementBanner({ announcements }: { announcements: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!announcements || announcements.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(id)
  }, [announcements])

  if (!announcements || announcements.length === 0) return null

  return (
    <div className="hidden sm:flex h-9 items-center justify-center overflow-hidden bg-foreground text-background">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-medium tracking-wide"
        >
          {announcements[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
