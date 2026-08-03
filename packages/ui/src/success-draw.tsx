"use client";

import { motion } from "framer-motion";
import { springs, durations, easings } from '@corecart/shared';

interface SuccessDrawProps {
  size?: number;
  className?: string;
  color?: string;
}

export function SuccessDraw({
  size = 64,
  className = "",
  color = "currentColor",
}: SuccessDrawProps) {
  // SVG drawing paths
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Draw Circle */}
        <motion.circle
          cx="25"
          cy="25"
          r="23"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Draw Checkmark */}
        <motion.path
          d="M15 24.5L22 31.5L35 18.5"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
        />
      </svg>
      
      {/* Decorative clean mini-confetti burst dots */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(6)].map((_, i) => {
          const angle = (i * 360) / 6;
          const rad = (angle * Math.PI) / 180;
          const targetX = Math.cos(rad) * (size * 0.7);
          const targetY = Math.sin(rad) * (size * 0.7);
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: targetX,
                y: targetY,
                scale: [0, 1.2, 0],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.7,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
