"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: (v: number) => string;
}

export function AnimatedNumber({
  value,
  className = "",
  format = (v: number) => Math.round(v).toLocaleString(),
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 15,
  });

  const displayValue = useTransform(springValue, (latest) => format(latest));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return displayValue.onChange((latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
  }, [displayValue]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
