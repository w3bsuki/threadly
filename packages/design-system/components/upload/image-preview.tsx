'use client';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, GripVertical } from 'lucide-react';
import Image from 'next/image';
import type { ImagePreviewProps } from './types';

export function ImagePreview({
  image,
  onRemove,
  onReorder,
  isMain = false,
  isDragging = false,
  className,
}: ImagePreviewProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden group transition-all',
        isDragging && 'opacity-50 scale-95',
        onReorder && 'cursor-move',
        className
      )}
      draggable={!!onReorder}
      onDragStart={onReorder?.onDragStart}
      onDragEnd={onReorder?.onDragEnd}
      onDragOver={onReorder?.onDragOver}
      onDrop={onReorder?.onDrop}
    >
      <div className="aspect-square relative">
        <Image
          src={image.url}
          alt={image.alt || 'Uploaded image'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          priority={isMain}
        />
        
        {onReorder && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background/90 backdrop-blur-sm rounded p-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}
        
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Remove image</span>
          </Button>
        )}
        
        {isMain && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-foreground/90 text-background text-xs px-2 py-1 rounded-sm font-medium">
              Main
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}