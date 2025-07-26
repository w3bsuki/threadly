'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ProductImage } from '../../types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const handleTouchStart = useRef<{ x: number; y: number } | null>(null);

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex((prev: number) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex((prev: number) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!handleTouchStart.current) {
      return;
    }

    const currentX = e.touches[0]!.clientX;
    const currentY = e.touches[0]!.clientY;
    const diffX = handleTouchStart.current!.x - currentX;
    const diffY = handleTouchStart.current!.y - currentY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleImageNavigation('next');
      } else {
        handleImageNavigation('prev');
      }
      handleTouchStart.current = null;
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div
        className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-secondary md:rounded-[var(--radius-2xl)]"
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => {
          handleTouchStart.current = {
            x: e.touches[0]!.clientX,
            y: e.touches[0]!.clientY,
          };
        }}
      >
        {images[selectedImageIndex] ? (
          <Image
            alt={images[selectedImageIndex].alt || title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            src={images[selectedImageIndex].imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/70">
            <Package className="h-16 w-16" />
          </div>
        )}

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              className="-translate-y-1/2 absolute top-1/2 left-2 h-10 w-10 rounded-[var(--radius-full)] bg-background/80 p-0 shadow-sm backdrop-blur-sm hover:bg-background"
              onClick={() => handleImageNavigation('prev')}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              className="-translate-y-1/2 absolute top-1/2 right-2 h-10 w-10 rounded-[var(--radius-full)] bg-background/80 p-0 shadow-sm backdrop-blur-sm hover:bg-background"
              onClick={() => handleImageNavigation('next')}
              size="sm"
              variant="ghost"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Image indicators */}
            <div className="-translate-x-1/2 absolute bottom-4 left-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  className={cn(
                    'h-2 w-2 rounded-[var(--radius-full)] transition-colors',
                    index === selectedImageIndex
                      ? 'bg-background'
                      : 'bg-background/50'
                  )}
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Grid - Desktop only */}
      {images.length > 1 && (
        <div className="hidden grid-cols-4 gap-2 md:grid">
          {images.map((image, index) => (
            <button
              className={cn(
                'aspect-square overflow-hidden rounded-[var(--radius-lg)] border-2 bg-secondary transition-colors',
                selectedImageIndex === index
                  ? 'border-black'
                  : 'border-transparent hover:border-gray-300'
              )}
              key={index}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                alt={image.alt || `${title} ${index + 1}`}
                className="h-full w-full object-cover"
                height={120}
                src={image.imageUrl}
                width={120}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}