'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@repo/design-system/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Generate a simple blur placeholder
const generateBlurDataURL = (width: number = 8, height: number = 8): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" opacity="0.5"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>`
  ).toString('base64')}`;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use provided blur or generate one
  const finalBlurDataURL = blurDataURL || (placeholder === 'blur' ? generateBlurDataURL() : undefined);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // If there's an error, show a fallback
  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-gray-100 flex items-center justify-center text-gray-400 text-sm",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span>Image unavailable</span>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      className
    ),
    sizes,
    priority,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    ...(placeholder === 'blur' && finalBlurDataURL ? {
      placeholder: 'blur' as const,
      blurDataURL: finalBlurDataURL,
    } : {}),
  };

  if (fill) {
    return (
      <div className="relative">
        <Image
          {...imageProps}
          fill
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

// Product-specific image component with proper aspect ratios
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative aspect-square overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}

// Hero/banner image with proper sizing
export function HeroImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[16/9] md:aspect-[21/9] overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        quality={90}
      />
    </div>
  );
}

// Avatar/profile image
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}