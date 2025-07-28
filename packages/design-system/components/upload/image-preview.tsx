'use client';

import { GripVertical, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
        'group relative overflow-hidden transition-all',
        isDragging && 'scale-95 opacity-50',
        onReorder && 'cursor-move',
        className
      )}
      draggable={!!onReorder}
      onDragEnd={onReorder?.onDragEnd}
      onDragOver={onReorder?.onDragOver}
      onDragStart={onReorder?.onDragStart}
      onDrop={onReorder?.onDrop}
    >
      <div className="relative aspect-square">
        <Image
          alt={image.alt || 'Uploaded image'}
          className="object-cover"
          fill
          priority={isMain}
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          src={image.url}
        />

        {onReorder && (
          <div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded bg-background/90 p-1 backdrop-blur-sm">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {onRemove && (
          <Button
            className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="destructive"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Remove image</span>
          </Button>
        )}

        {isMain && (
          <div className="absolute bottom-2 left-2">
            <div className="rounded-sm bg-foreground/90 px-2 py-1 font-medium text-background text-xs">
              Main
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
