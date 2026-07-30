"use client";

import { motion } from "framer-motion";
import { motionPresets } from '@corecart/shared/src/motion/presets';
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.main
      key={pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={motionPresets.page}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.main>
  );
}
