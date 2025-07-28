'use client';

import { cn } from '@repo/design-system/lib/utils';
import { Trash2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';

interface SwipeableItemProps {
  onDelete?: () => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  children: React.ReactNode;
  className?: string;
  deleteThreshold?: number;
  enableDelete?: boolean;
}

/**
 * Swipeable list item with visual feedback
 * Following CONTEXT.md gesture implementation patterns
 * Using native touch events instead of external dependencies
 */
export function SwipeableItem({
  onDelete,
  onSwipe,
  children,
  className,
  deleteThreshold = 100,
  enableDelete = true,
}: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current) return;

      currentXRef.current = e.touches[0].clientX;
      const deltaX = currentXRef.current - startXRef.current;

      // Limit swipe to left if delete is disabled
      if (!enableDelete && deltaX < 0) {
        setTranslateX(0);
        return;
      }

      // Add resistance for right swipe
      const resistedDeltaX = deltaX > 0 ? deltaX * 0.5 : deltaX;
      setTranslateX(resistedDeltaX);
    },
    [enableDelete]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    const deltaX = currentXRef.current - startXRef.current;
    const velocity = Math.abs(deltaX) / 200; // Simple velocity calculation

    if (Math.abs(deltaX) > deleteThreshold && velocity > 0.2) {
      if (deltaX < 0 && enableDelete) {
        // Swipe left - delete
        hapticFeedback.medium();
        setIsDeleting(true);
        setTranslateX(-window.innerWidth);
        setTimeout(() => {
          onDelete?.();
        }, 300);
        onSwipe?.('left');
      } else if (deltaX > 0) {
        // Swipe right
        hapticFeedback.light();
        setTranslateX(0);
        onSwipe?.('right');
      }
    } else {
      // Spring back
      setTranslateX(0);
    }
  }, [deleteThreshold, enableDelete, onDelete, onSwipe]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Delete indicator background */}
      {enableDelete && (
        <div className="absolute inset-0 flex items-center justify-end bg-destructive px-6">
          <Trash2 className="h-5 w-5 text-destructive-foreground" />
        </div>
      )}

      {/* Swipeable content */}
      <div
        className={cn(
          'relative bg-background',
          'touch-pan-y touch-manipulation',
          isDeleting && 'pointer-events-none'
        )}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDraggingRef.current
            ? 'none'
            : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
