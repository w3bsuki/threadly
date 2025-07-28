'use client';

import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ImagePreview } from './image-preview';
import type { ImageGalleryProps } from './types';

export function ImageGallery({
  images,
  onRemove,
  onReorder,
  className,
  gridClassName,
  itemClassName,
}: ImageGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || !onReorder) return;

      if (draggedIndex !== dropIndex) {
        onReorder(draggedIndex, dropIndex);
      }

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorder]
  );

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5',
          gridClassName
        )}
      >
        {sortedImages.map((image, index) => (
          <div
            className={cn(
              'relative transition-all',
              dragOverIndex === index && draggedIndex !== index && 'scale-105',
              itemClassName
            )}
            key={image.id || index}
          >
            <ImagePreview
              image={image}
              isDragging={draggedIndex === index}
              isMain={index === 0}
              onRemove={onRemove ? () => onRemove(index) : undefined}
              onReorder={
                onReorder
                  ? {
                      onDragStart: () => handleDragStart(index),
                      onDragEnd: handleDragEnd,
                      onDragOver: (e) => handleDragOver(e, index),
                      onDrop: (e) => handleDrop(e, index),
                    }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {onReorder && images.length > 1 && (
        <p className="text-center text-muted-foreground text-xs">
          Drag and drop to reorder images
        </p>
      )}
    </div>
  );
}
