'use client';

import { cn } from '@repo/design-system/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useVirtualImageList } from '../../hooks/use-lazy-load-images';
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

  const displayImages = enableVirtualization
    ? virtualList.visibleItems
    : images;

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
        className={cn(
          'relative',
          enableVirtualization && 'overflow-y-auto',
          className
        )}
        onScroll={enableVirtualization ? virtualList.handleScroll : undefined}
        ref={containerRef}
        style={enableVirtualization ? { height: containerHeight } : undefined}
      >
        {enableVirtualization && (
          <div
            style={{ height: virtualList.totalHeight, position: 'relative' }}
          >
            <div
              style={{
                transform: `translateY(${virtualList.offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <div className={cn('grid', `grid-cols-${columns}`, `gap-${gap}`)}>
                {displayImages.map((image, index) => (
                  <div
                    className={cn(
                      'relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)]',
                      itemClassName
                    )}
                    key={image.id}
                    onClick={() =>
                      enableLightbox &&
                      setSelectedIndex(virtualList.startIndex + index)
                    }
                    style={{ height: itemHeight }}
                  >
                    <img
                      alt={image.alt || `Image ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      src={image.imageUrl}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!enableVirtualization && (
          <div className={cn('grid', `grid-cols-${columns}`, `gap-${gap}`)}>
            {displayImages.map((image, index) => (
              <div
                className={cn(
                  'relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius-lg)]',
                  itemClassName
                )}
                key={image.id}
                onClick={() => enableLightbox && setSelectedIndex(index)}
              >
                <img
                  alt={image.alt || `Image ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  src={image.imageUrl}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {enableLightbox && selectedIndex !== null && (
        <Dialog onOpenChange={() => setSelectedIndex(null)} open={true}>
          <DialogContent
            className="max-h-[90vh] max-w-[90vw] p-0"
            onKeyDown={handleKeyDown}
          >
            <div className="relative flex h-full w-full items-center justify-center bg-foreground">
              <Button
                className="absolute top-4 right-4 z-10 text-background hover:bg-background/20"
                onClick={() => setSelectedIndex(null)}
                size="icon"
                variant="ghost"
              >
                <X className="h-6 w-6" />
              </Button>

              {selectedIndex > 0 && (
                <Button
                  className="-translate-y-1/2 absolute top-1/2 left-4 z-10 text-background hover:bg-background/20"
                  onClick={handlePrevious}
                  size="icon"
                  variant="ghost"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {selectedIndex < images.length - 1 && (
                <Button
                  className="-translate-y-1/2 absolute top-1/2 right-4 z-10 text-background hover:bg-background/20"
                  onClick={handleNext}
                  size="icon"
                  variant="ghost"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              <div className="relative h-full max-h-[80vh] w-full max-w-[80vw]">
                <img
                  alt={
                    images[selectedIndex].alt || `Image ${selectedIndex + 1}`
                  }
                  className="absolute inset-0 h-full w-full object-contain"
                  src={images[selectedIndex].imageUrl}
                />
              </div>

              <div className="-translate-x-1/2 absolute bottom-4 left-1/2 text-background text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
