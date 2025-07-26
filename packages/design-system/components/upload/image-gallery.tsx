'use client';

import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { ImagePreview } from './image-preview';
import { Button } from '../ui/button';
import { Upload } from 'lucide-react';
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

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || !onReorder) return;
    
    if (draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onReorder]);

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3',
          gridClassName
        )}
      >
        {sortedImages.map((image, index) => (
          <div
            key={image.id || index}
            className={cn(
              'relative transition-all',
              dragOverIndex === index && draggedIndex !== index && 'scale-105',
              itemClassName
            )}
          >
            <ImagePreview
              image={image}
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
              isMain={index === 0}
              isDragging={draggedIndex === index}
            />
          </div>
        ))}
      </div>
      
      {onReorder && images.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Drag and drop to reorder images
        </p>
      )}
    </div>
  );
}