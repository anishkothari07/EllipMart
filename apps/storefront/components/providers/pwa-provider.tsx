'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => console.log('[PWA] Service worker registered successfully with scope:', reg.scope))
          .catch((err) => console.error('[PWA] Service worker registration failed:', err));
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    const goOnline = () => setIsOffline(false);
    const goOffline = () => {
      setIsOffline(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 inset-x-0 z-[100] bg-red-600 text-white p-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-md text-center"
          >
            <WifiOff className="size-4 animate-pulse" />
            <span>You are currently browsing offline. Cached pages remain accessible.</span>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
