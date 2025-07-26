'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from '@repo/design-system/components';

interface MobileInteractionsProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  enableHaptic?: boolean;
  enableSwipeGestures?: boolean;
}

// Haptic feedback utility
const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    // iOS haptic feedback
    if ('webkitVibrate' in navigator) {
      (navigator as unknown as { webkitVibrate: (duration: number) => void }).webkitVibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
    if ('webkitVibrate' in navigator) {
      (navigator as unknown as { webkitVibrate: (duration: number) => void }).webkitVibrate(20);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
    if ('webkitVibrate' in navigator) {
      (navigator as unknown as { webkitVibrate: (pattern: number[]) => void }).webkitVibrate([30, 10, 30]);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 10, 15]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 20, 50, 20, 50]);
    }
  }
};

// Pull-to-refresh component
function PullToRefresh({ 
  onRefresh, 
  children 
}: { 
  onRefresh?: () => Promise<void>; 
  children: React.ReactNode; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const pullDistance = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const isPulling = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!onRefresh || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, [onRefresh]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || !onRefresh || isRefreshing.current) return;

    currentY.current = e.touches[0].clientY;
    pullDistance.current = Math.max(0, currentY.current - startY.current);

    if (pullDistance.current > 0) {
      e.preventDefault();
      
      const maxPull = 120;
      const normalizedDistance = Math.min(pullDistance.current, maxPull);
      const opacity = normalizedDistance / maxPull;
      const scale = 0.5 + (opacity * 0.5);

      if (refreshRef.current) {
        refreshRef.current.style.transform = `translateY(${normalizedDistance}px) scale(${scale})`;
        refreshRef.current.style.opacity = opacity.toString();
      }

      // Haptic feedback at pull threshold
      if (normalizedDistance > 80 && normalizedDistance < 85) {
        hapticFeedback.light();
      }
    }
  }, [onRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || !onRefresh) return;

    isPulling.current = false;

    if (pullDistance.current > 80 && !isRefreshing.current) {
      isRefreshing.current = true;
      hapticFeedback.medium();
      
      if (refreshRef.current) {
        refreshRef.current.style.transform = 'translateY(60px) scale(1)';
        refreshRef.current.style.opacity = '1';
      }

      try {
        await onRefresh();
        hapticFeedback.success();
        toast.success('Content refreshed');
      } catch (error) {
        hapticFeedback.error();
        toast.error('Failed to refresh');
      } finally {
        isRefreshing.current = false;
        if (refreshRef.current) {
          refreshRef.current.style.transform = 'translateY(-60px) scale(0.5)';
          refreshRef.current.style.opacity = '0';
        }
      }
    } else {
      if (refreshRef.current) {
        refreshRef.current.style.transform = 'translateY(-60px) scale(0.5)';
        refreshRef.current.style.opacity = '0';
      }
    }

    pullDistance.current = 0;
  }, [onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onRefresh) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, onRefresh]);

  if (!onRefresh) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={refreshRef}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-[var(--radius-full)] shadow-lg transition-all duration-200 ease-out opacity-0 z-50"
        style={{ transform: 'translateX(-50%) translateY(-60px) scale(0.5)' }}
      >
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}

// Swipe gesture detector
function SwipeGestureDetector({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  enableHaptic 
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enableHaptic?: boolean;
}) {
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const threshold = 50; // Minimum swipe distance
  const restraint = 100; // Maximum vertical movement for horizontal swipe

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!e.changedTouches[0]) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;

    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > threshold && Math.abs(deltaY) < restraint) {
      if (enableHaptic) {
        hapticFeedback.light();
      }

      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, enableHaptic]);

  return (
    <div
      onTouchStart={(e) => handleTouchStart(e.nativeEvent)}
      onTouchEnd={(e) => handleTouchEnd(e.nativeEvent)}
      className="touch-pan-y"
    >
      {children}
    </div>
  );
}

// Offline indicator
function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-background text-center py-2 text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-background rounded-[var(--radius-full)]"></div>
        You're offline. Some features may not work.
      </div>
    </div>
  );
}

// Enhanced button with haptic feedback
export function HapticButton({
  children,
  onClick,
  feedbackType = 'light',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  feedbackType?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const handleClick = useCallback(() => {
    hapticFeedback[feedbackType]();
    onClick?.();
  }, [onClick, feedbackType]);

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

// Main component
export function MobileInteractions({
  children,
  onRefresh,
  enableHaptic = true,
  enableSwipeGestures = false
}: MobileInteractionsProps) {
  // Add haptic feedback to all interactive elements
  useEffect(() => {
    if (!enableHaptic) return;

    const addHapticToButtons = () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        const handleClick = () => hapticFeedback.light();
        button.addEventListener('click', handleClick);
        
        return () => button.removeEventListener('click', handleClick);
      });
    };

    addHapticToButtons();

    // Re-add haptic feedback when DOM changes
    const observer = new MutationObserver(addHapticToButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enableHaptic]);

  const content = (
    <PullToRefresh onRefresh={onRefresh}>
      {children}
      <OfflineIndicator />
    </PullToRefresh>
  );

  if (enableSwipeGestures) {
    return (
      <SwipeGestureDetector enableHaptic={enableHaptic}>
        {content}
      </SwipeGestureDetector>
    );
  }

  return content;
}

// Export haptic utilities for use in other components
export { hapticFeedback };