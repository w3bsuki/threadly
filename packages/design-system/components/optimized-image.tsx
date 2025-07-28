'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  aspectRatio?: string;
  fill?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  className,
  onLoad,
  aspectRatio,
  fill = false,
  sizes,
  placeholder,
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is now in viewport, Next.js will handle loading
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted', className)}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <span className="text-muted-foreground text-sm">
          Image not available
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-muted',
        className
      )}
      ref={imgRef}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        alt={alt}
        blurDataURL={blurDataURL}
        className={cn(
          'duration-700 ease-in-out',
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0'
        )}
        fill={fill}
        height={fill ? undefined : height}
        onError={handleError}
        onLoad={handleLoad}
        placeholder={placeholder}
        priority={priority}
        quality={quality}
        sizes={
          sizes ||
          (fill
            ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            : undefined)
        }
        src={src}
        width={fill ? undefined : width}
      />
    </div>
  );
}
