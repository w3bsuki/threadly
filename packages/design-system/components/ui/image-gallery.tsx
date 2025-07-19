'use client';

import { useRef, useState } from 'react';
import { cn } from '@repo/design-system/lib/utils';
import { useVirtualImageList } from '../../hooks/use-lazy-load-images';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent } from './dialog';

interface ImageItem {
  id: string;
  imageUrl: string;
  alt?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  className?: string;
  itemClassName?: string;
  columns?: number;
  gap?: number;
  enableLightbox?: boolean;
  enableVirtualization?: boolean;
  itemHeight?: number;
}

export function ImageGallery({
  images,
  className,
  itemClassName,
  columns = 3,
  gap = 4,
  enableLightbox = true,
  enableVirtualization = false,
  itemHeight = 300,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Virtual scrolling for large lists
  const virtualList = useVirtualImageList({
    items: images,
    itemHeight: itemHeight + gap,
    containerHeight,
    overscan: 2,
  });

  const displayImages = enableVirtualization ? virtualList.visibleItems : images;

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return;

    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        setSelectedIndex(null);
        break;
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'relative',
          enableVirtualization && 'overflow-y-auto',
          className
        )}
        style={enableVirtualization ? { height: containerHeight } : undefined}
        onScroll={enableVirtualization ? virtualList.handleScroll : undefined}
      >
        {enableVirtualization && (
          <div style={{ height: virtualList.totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${virtualList.offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <div
                className={cn(
                  'grid',
                  `grid-cols-${columns}`,
                  `gap-${gap}`
                )}
              >
                {displayImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={cn(
                      'relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)]',
                      itemClassName
                    )}
                    style={{ height: itemHeight }}
                    onClick={() => enableLightbox && setSelectedIndex(virtualList.startIndex + index)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.alt || `Image ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!enableVirtualization && (
          <div
            className={cn(
              'grid',
              `grid-cols-${columns}`,
              `gap-${gap}`
            )}
          >
            {displayImages.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  'relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)] aspect-square',
                  itemClassName
                )}
                onClick={() => enableLightbox && setSelectedIndex(index)}
              >
                <img
                  src={image.imageUrl}
                  alt={image.alt || `Image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {enableLightbox && selectedIndex !== null && (
        <Dialog open={true} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent
            className="max-w-[90vw] max-h-[90vh] p-0"
            onKeyDown={handleKeyDown}
          >
            <div className="relative w-full h-full flex items-center justify-center bg-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-background hover:bg-background/20 z-10"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20 z-10"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {selectedIndex < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20 z-10"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              <div className="relative w-full h-full max-w-[80vw] max-h-[80vh]">
                <img
                  src={images[selectedIndex].imageUrl}
                  alt={images[selectedIndex].alt || `Image ${selectedIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}