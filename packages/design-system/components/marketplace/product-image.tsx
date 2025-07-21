'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import { Package } from 'lucide-react';

export interface ProductImageProps {
  src: string;
  alt: string;
  aspectRatio?: '1/1' | '3/4' | '4/5' | '16/9';
  priority?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  blur?: boolean;
  quality?: number;
}

const aspectRatioClasses = {
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  '16/9': 'aspect-video',
};

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  aspectRatio = '3/4',
  priority = false,
  className,
  fallback,
  onLoad,
  onError,
  blur = true,
  quality = 85,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

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
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
      <div className="flex flex-col items-center gap-2">
        <Package className="h-8 w-8" />
        <span className="text-xs font-medium">No Image</span>
      </div>
    </div>
  );

  return (
    <div className={cn('relative overflow-hidden bg-muted', aspectRatioClasses[aspectRatio], className)}>
      {!imageError && src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            quality={quality}
            priority={priority}
            className={cn(
              'object-cover transition-all duration-300',
              isLoading && blur && 'blur-sm scale-105',
              !isLoading && 'blur-0 scale-100'
            )}
            onLoad={handleLoad}
            onError={handleError}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isLoading && blur && (
            <div className="absolute inset-0 bg-muted/20 animate-pulse" />
          )}
        </>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

// Optimized gallery component for multiple product images
export interface ProductImageGalleryProps {
  images: Array<{ imageUrl: string; alt?: string; id?: string }>;
  currentIndex?: number;
  onImageChange?: (index: number) => void;
  aspectRatio?: '1/1' | '3/4' | '4/5' | '16/9';
  showThumbnails?: boolean;
  className?: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  currentIndex = 0,
  onImageChange,
  aspectRatio = '3/4',
  showThumbnails = true,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(currentIndex);

  React.useEffect(() => {
    setSelectedIndex(currentIndex);
  }, [currentIndex]);

  const handleImageSelect = (index: number) => {
    setSelectedIndex(index);
    onImageChange?.(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={className}>
        <ProductImage
          src=""
          alt="No images available"
          aspectRatio={aspectRatio}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <ProductImage
        src={images[selectedIndex]?.imageUrl || ''}
        alt={images[selectedIndex]?.alt || `Product image ${selectedIndex + 1}`}
        aspectRatio={aspectRatio}
        priority={selectedIndex === 0}
        className="w-full"
      />

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => handleImageSelect(index)}
              className={cn(
                'relative rounded-[var(--radius-lg)] overflow-hidden border-2 transition-all',
                selectedIndex === index
                  ? 'border-primary shadow-md'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <ProductImage
                src={image.imageUrl}
                alt={image.alt || `Thumbnail ${index + 1}`}
                aspectRatio="1/1"
                className="h-16 w-16"
                blur={false}
                quality={60}
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center text-background text-xs font-medium">
                  +{images.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};