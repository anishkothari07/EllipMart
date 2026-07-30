'use client';

import React, { useState } from 'react';
import { cn } from '@corecart/shared';
import { motion } from 'framer-motion';

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  blurHash?: string;
  focusX?: number;
  focusY?: number;
  variants?: {
    variantName: string;
    publicUrl: string | null;
    width?: number | null;
  }[];
  aspectRatio?: string;
}

export function SmartImage({
  src,
  alt,
  className,
  blurHash,
  focusX = 0.5,
  focusY = 0.5,
  variants = [],
  aspectRatio,
  style,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate srcset from variants if provided
  const srcSet = variants
    .filter((v) => v.publicUrl && v.width)
    .map((v) => `${v.publicUrl} ${v.width}w`)
    .join(', ');

  const objectPosition = `${Math.round(focusX * 100)}% ${Math.round(focusY * 100)}%`;

  return (
    <div
      className={cn('relative overflow-hidden bg-muted/30', className)}
      style={{
        aspectRatio: aspectRatio || undefined,
      }}
    >
      {/* Blur Hash or Skeleton Placeholder */}
      {blurHash && !loaded && !error && (
        <img
          src={blurHash}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover blur-lg scale-110 opacity-70 transition-opacity duration-300 pointer-events-none"
          style={{ objectPosition }}
        />
      )}

      {/* Main Image */}
      <motion.img
        src={error ? '/placeholder.svg' : src}
        srcSet={srcSet || undefined}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.02 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="size-full object-cover"
        style={{
          objectPosition,
          ...style,
        }}
        {...(props as any)}
      />
    </div>
  );
}
