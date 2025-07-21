'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '../../lib/utils';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  aspectRatio?: 'square' | 'video' | '3/4' | '4/5' | 'auto';
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  blur?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  auto: '',
};

export const LazyImage = ({
  src,
  alt,
  width,
  height,
  fill = false,
  aspectRatio = 'auto',
  priority = false,
  className,
  containerClassName,
  fallback,
  onLoad,
  onError,
  blur = true,
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'empty',
  blurDataURL,
}: LazyImageProps) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInView, setIsInView] = React.useState(priority);
  const ref = React.useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority, isInView]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  const defaultFallback = (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-[var(--radius-full)] bg-muted-foreground/20 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <span className="text-xs">Image unavailable</span>
      </div>
    </div>
  );

  const containerClasses = cn(
    'relative overflow-hidden bg-muted',
    fill && aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
    containerClassName
  );

  const imageClasses = cn(
    'transition-all duration-300',
    isLoading && blur && 'blur-sm scale-105',
    !isLoading && 'blur-0 scale-100',
    className
  );

  // Loading placeholder while not in view
  if (!isInView) {
    return (
      <div ref={ref} className={containerClasses}>
        <div className="absolute inset-0 bg-muted animate-pulse" />
      </div>
    );
  }

  // Error state
  if (imageError) {
    return (
      <div ref={ref} className={containerClasses}>
        {fallback || defaultFallback}
      </div>
    );
  }

  return (
    <div ref={ref} className={containerClasses}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
      />
      {isLoading && blur && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
    </div>
  );
};

// Avatar variant for user profile images
export interface LazyAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const LazyAvatar = ({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className,
  priority = false,
}: LazyAvatarProps) => {
  const [imageError, setImageError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (fallbackInitials) return fallbackInitials;
    
    return alt
      .split(' ')
      .slice(0, 2)
      .map(name => name[0])
      .join('')
      .toUpperCase();
  }, [alt, fallbackInitials]);

  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary-foreground font-medium">
      {initials}
    </div>
  );

  return (
    <div className={cn('rounded-[var(--radius-full)] overflow-hidden', sizeClasses[size], className)}>
      {src && !imageError ? (
        <LazyImage
          src={src}
          alt={alt}
          fill
          aspectRatio="square"
          priority={priority}
          fallback={fallback}
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 96px, 128px"
        />
      ) : (
        fallback
      )}
    </div>
  );
};