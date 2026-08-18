'use client';

import React from 'react';
import { Sidebar } from '@/components/seller/layout/Sidebar';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 left-0 z-50 w-64 md:hidden flex flex-col bg-card"
          >
            {/* Close button inside drawer */}
            <button
              onClick={onClose}
              aria-label="Close Navigation Drawer"
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
