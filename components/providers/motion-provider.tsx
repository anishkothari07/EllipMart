"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { motionPresets } from "@/lib/motion/presets";
import { durations, springs, easings } from "@/lib/motion/tokens";

interface MotionContextType {
  reducedMotion: boolean;
  performanceMode: boolean;
  setPerformanceMode: (mode: boolean) => void;
  presets: typeof motionPresets;
  tokens: {
    durations: typeof durations;
    springs: typeof springs;
    easings: typeof easings;
  };
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const value: MotionContextType = {
    reducedMotion,
    performanceMode,
    setPerformanceMode,
    presets: motionPresets,
    tokens: { durations, springs, easings },
  };

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useMotion must be used within a MotionProvider");
  }
  return context;
}
