'use client';

import { useEffect, useRef, useCallback, useState, forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Haptic feedback types
type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

// Haptic feedback patterns (in milliseconds)
const HAPTIC_PATTERNS: Record<HapticFeedbackType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30],
  success: [15, 10, 15],
  error: [50, 20, 50, 20, 50]
};

// Screen reader announcement utility
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};

// Haptic feedback utility
export const hapticFeedback = {
  isSupported: () => {
    if (typeof window === 'undefined') return false;
    return 'vibrate' in navigator || 'webkitVibrate' in navigator;
  },

  trigger: (type: HapticFeedbackType) => {
    if (!hapticFeedback.isSupported()) return;

    const pattern = HAPTIC_PATTERNS[type];
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      } else if ('webkitVibrate' in navigator) {
        (navigator as any).webkitVibrate(pattern);
      }
    } catch (error) {
      // Silently fail - haptic feedback is enhancement only
    }
  },

  light: () => hapticFeedback.trigger('light'),
  medium: () => hapticFeedback.trigger('medium'),
  heavy: () => hapticFeedback.trigger('heavy'),
  success: () => hapticFeedback.trigger('success'),
  error: () => hapticFeedback.trigger('error'),

  custom: (pattern: number[]) => {
    if (!hapticFeedback.isSupported()) return;
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      } else if ('webkitVibrate' in navigator) {
        (navigator as any).webkitVibrate(pattern);
      }
    } catch (error) {
      // Silently fail
    }
  }
};

// Pull-to-refresh indicator component
interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold: number;
}

const PullToRefreshIndicator = ({ pullDistance, isRefreshing, threshold }: PullToRefreshIndicatorProps) => {
  const normalizedDistance = Math.min(pullDistance, threshold * 1.5);
  const opacity = Math.min(normalizedDistance / threshold, 1);
  const scale = 0.5 + (opacity * 0.5);
  const rotation = normalizedDistance * 3;

  return (
    <div
      className={cn(
        "absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10",
        "flex items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "transition-all duration-200 ease-out",
        "pointer-events-none z-50",
        pullDistance > 0 ? "opacity-100" : "opacity-0"
      )}
      style={{
        transform: `translateX(-50%) translateY(${normalizedDistance - 50}px) scale(${scale})`,
        opacity
      }}
      role="status"
      aria-label={isRefreshing ? "Refreshing content" : `Pull ${pullDistance >= threshold ? 'to refresh' : 'down more to refresh'}`}
      aria-live="polite"
    >
      <svg
        className={cn("w-5 h-5", isRefreshing && "animate-spin")}
        fill="none"
        viewBox="0 0 24 24"
        style={{ transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined }}
        aria-hidden="true"
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
  );
};

// Pull-to-refresh hook
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  disabled?: boolean;
}

const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  disabled = false
}: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const hasAnnouncedThreshold = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || window.scrollY > 0) return;
    
    startY.current = e.touches[0]?.clientY || 0;
    setIsPulling(true);
    hasAnnouncedThreshold.current = false;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing || window.scrollY > 0) return;

    currentY.current = e.touches[0]?.clientY || 0;
    const distance = Math.max(0, currentY.current - startY.current);

    if (distance > 0) {
      // Only prevent default when actually pulling to refresh
      if (isPulling && distance > 5) {
        e.preventDefault();
      }
      const resistedDistance = distance / resistance;
      setPullDistance(resistedDistance);

      // Haptic feedback and screen reader announcement at threshold
      if (resistedDistance >= threshold && !hasAnnouncedThreshold.current) {
        hapticFeedback.light();
        announceToScreenReader('Release to refresh');
        hasAnnouncedThreshold.current = true;
      }
    }
  }, [isPulling, disabled, isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      hapticFeedback.medium();
      announceToScreenReader('Refreshing content');

      try {
        await onRefresh();
        hapticFeedback.success();
        announceToScreenReader('Content refreshed successfully');
      } catch (error) {
        hapticFeedback.error();
        announceToScreenReader('Refresh failed. Please try again.');
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Keyboard support for pull-to-refresh
  const handleKeyboardRefresh = useCallback(async (e: KeyboardEvent) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
      e.preventDefault();
      setIsRefreshing(true);
      announceToScreenReader('Refreshing content');
      
      try {
        await onRefresh();
        announceToScreenReader('Content refreshed successfully');
      } catch (error) {
        announceToScreenReader('Refresh failed. Please try again.');
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    threshold,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onKeyDown: handleKeyboardRefresh
    }
  };
};

// Swipe gesture detection hook
interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  restraint?: number;
  allowMouseEvents?: boolean;
}

const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  restraint = 100,
  allowMouseEvents = false
}: UseSwipeGestureOptions) => {
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((clientX: number, clientY: number) => {
    touchStart.current = { x: clientX, y: clientY };
  }, []);

  const handleEnd = useCallback((clientX: number, clientY: number) => {
    touchEnd.current = { x: clientX, y: clientY };

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Horizontal swipe
    if (absX > threshold && absY < restraint) {
      if (deltaX > 0 && onSwipeRight) {
        hapticFeedback.light();
        announceToScreenReader('Swiped right');
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        hapticFeedback.light();
        announceToScreenReader('Swiped left');
        onSwipeLeft();
      }
    }

    // Vertical swipe
    if (absY > threshold && absX < restraint) {
      if (deltaY > 0 && onSwipeDown) {
        hapticFeedback.light();
        announceToScreenReader('Swiped down');
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        hapticFeedback.light();
        announceToScreenReader('Swiped up');
        onSwipeUp();
      }
    }
  }, [threshold, restraint, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Keyboard alternatives for swipe gestures
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!e.ctrlKey) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (onSwipeLeft) {
          announceToScreenReader('Navigated left');
          onSwipeLeft();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (onSwipeRight) {
          announceToScreenReader('Navigated right');
          onSwipeRight();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (onSwipeUp) {
          announceToScreenReader('Navigated up');
          onSwipeUp();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (onSwipeDown) {
          announceToScreenReader('Navigated down');
          onSwipeDown();
        }
        break;
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => handleStart(e.touches[0]?.clientX || 0, e.touches[0]?.clientY || 0),
    onTouchEnd: (e: React.TouchEvent) => handleEnd(e.changedTouches[0]?.clientX || 0, e.changedTouches[0]?.clientY || 0),
    onKeyDown: handleKeyDown,
    ...(allowMouseEvents && {
      onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX, e.clientY),
      onMouseUp: (e: React.MouseEvent) => handleEnd(e.clientX, e.clientY)
    })
  };

  return handlers;
};

// Long press detection hook
interface UseLongPressOptions {
  onLongPress: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

const useLongPress = ({
  onLongPress,
  threshold = 500,
  preventDefault = true
}: UseLongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPressed = useRef(false);

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    isPressed.current = true;
    timerRef.current = setTimeout(() => {
      if (isPressed.current) {
        hapticFeedback.medium();
        announceToScreenReader('Long press activated');
        onLongPress();
      }
    }, threshold);
  }, [onLongPress, threshold, preventDefault]);

  const cancel = useCallback(() => {
    isPressed.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Keyboard alternative for long press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      announceToScreenReader('Long press activated via keyboard');
      onLongPress();
    }
  }, [onLongPress]);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onKeyDown: handleKeyDown
  };
};

// Double tap detection hook
interface UseDoubleTapOptions {
  onDoubleTap: () => void;
  threshold?: number;
}

const useDoubleTap = ({
  onDoubleTap,
  threshold = 300
}: UseDoubleTapOptions) => {
  const lastTap = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < threshold) {
      hapticFeedback.light();
      announceToScreenReader('Double tap activated');
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [onDoubleTap, threshold]);

  // Keyboard alternative for double tap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      announceToScreenReader('Double tap activated via keyboard');
      onDoubleTap();
    }
  }, [onDoubleTap]);

  return {
    onClick: handleTap,
    onKeyDown: handleKeyDown
  };
};

// Mobile interactions provider component
interface MobileInteractionsProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  enablePullToRefresh?: boolean;
  enableSwipeGestures?: boolean;
  enableHapticFeedback?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const MobileInteractions = forwardRef<HTMLDivElement, MobileInteractionsProps>(({
  children,
  onRefresh,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enablePullToRefresh = true,
  enableSwipeGestures = true,
  enableHapticFeedback = true,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mergedRef = ref || containerRef;

  // Pull-to-refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: onRefresh || (async () => {}),
    disabled: !enablePullToRefresh || !onRefresh
  });

  // Swipe gestures
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  });

  // Add haptic feedback to all interactive elements
  useEffect(() => {
    if (!enableHapticFeedback) return;

    const handleInteraction = () => hapticFeedback.light();
    const attachedElements = new WeakMap<Element, boolean>();
    
    const addHapticToElement = (element: Element) => {
      if (!attachedElements.has(element)) {
        element.addEventListener('click', handleInteraction, { passive: true });
        attachedElements.set(element, true);
      }
    };
    
    const removeHapticFromElement = (element: Element) => {
      if (attachedElements.has(element)) {
        element.removeEventListener('click', handleInteraction);
        attachedElements.delete(element);
      }
    };

    // Initial setup
    const selector = 'button, a[href], input, textarea, select, [role="button"], [tabindex]:not([tabindex="-1"])';
    const initialElements = document.querySelectorAll(selector);
    initialElements.forEach(addHapticToElement);

    // Observe only specific mutations
    let mutationTimeout: NodeJS.Timeout | null = null;
    const observer = new MutationObserver((mutations) => {
      // Debounce mutation handling
      if (mutationTimeout) clearTimeout(mutationTimeout);
      
      mutationTimeout = setTimeout(() => {
        mutations.forEach(mutation => {
          // Handle removed nodes
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches && element.matches(selector)) {
                removeHapticFromElement(element);
              }
              // Check descendants
              const descendants = element.querySelectorAll?.(selector);
              descendants?.forEach(removeHapticFromElement);
            }
          });
          
          // Handle added nodes
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches && element.matches(selector)) {
                addHapticToElement(element);
              }
              // Check descendants
              const descendants = element.querySelectorAll?.(selector);
              descendants?.forEach(addHapticToElement);
            }
          });
        });
      }, 100); // Debounce by 100ms
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });

    return () => {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      observer.disconnect();
      // Clean up all event listeners
      const allElements = document.querySelectorAll(selector);
      allElements.forEach(removeHapticFromElement);
    };
  }, [enableHapticFeedback]);

  // Setup pull-to-refresh event listeners
  useEffect(() => {
    if (!enablePullToRefresh || !onRefresh) return;

    const element = (mergedRef as React.RefObject<HTMLDivElement>).current;
    if (!element) return;

    const { onTouchStart, onTouchMove, onTouchEnd, onKeyDown } = pullToRefresh.handlers;

    // Use AbortController for better cleanup
    const controller = new AbortController();
    const signal = controller.signal;

    element.addEventListener('touchstart', onTouchStart as any, { passive: true, signal });
    element.addEventListener('touchmove', onTouchMove as any, { passive: false, signal });
    element.addEventListener('touchend', onTouchEnd as any, { passive: true, signal });
    element.addEventListener('touchcancel', onTouchEnd as any, { passive: true, signal });
    document.addEventListener('keydown', onKeyDown as any, { signal });

    return () => {
      controller.abort();
    };
  }, [enablePullToRefresh, onRefresh, pullToRefresh.handlers, mergedRef]);

  // Announce gesture controls to screen readers on mount
  useEffect(() => {
    const controls: string[] = [];
    
    if (enablePullToRefresh && onRefresh) {
      controls.push('Pull down or press F5 to refresh');
    }
    
    if (enableSwipeGestures) {
      const swipeControls: string[] = [];
      if (onSwipeLeft) swipeControls.push('Ctrl+Left Arrow to navigate left');
      if (onSwipeRight) swipeControls.push('Ctrl+Right Arrow to navigate right');
      if (onSwipeUp) swipeControls.push('Ctrl+Up Arrow to navigate up');
      if (onSwipeDown) swipeControls.push('Ctrl+Down Arrow to navigate down');
      controls.push(...swipeControls);
    }
    
    if (controls.length > 0) {
      announceToScreenReader(`Gesture controls available: ${controls.join(', ')}`);
    }
  }, [enablePullToRefresh, enableSwipeGestures, onRefresh, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <div
      ref={mergedRef}
      className={cn("relative", className)}
      {...(enableSwipeGestures ? swipeHandlers : {})}
      role="region"
      aria-label={ariaLabel || "Interactive content area"}
      aria-describedby={ariaDescribedBy}
      tabIndex={enableSwipeGestures ? 0 : undefined}
    >
      {enablePullToRefresh && onRefresh && (
        <PullToRefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          isRefreshing={pullToRefresh.isRefreshing}
          threshold={pullToRefresh.threshold}
        />
      )}
      {children}
    </div>
  );
});

MobileInteractions.displayName = 'MobileInteractions';

// Export hooks for individual use
export { usePullToRefresh, useSwipeGesture, useLongPress, useDoubleTap };

// Reachability helper component
interface ReachabilityZoneProps {
  children: React.ReactNode;
  onActivate?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const ReachabilityZone = ({ children, onActivate, className, 'aria-label': ariaLabel }: ReachabilityZoneProps) => {
  const doubleTapHandlers = useDoubleTap({
    onDoubleTap: () => {
      if (onActivate) {
        onActivate();
      } else {
        // Default behavior: scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        announceToScreenReader('Scrolled to top');
      }
    }
  });

  return (
    <div 
      className={cn("cursor-pointer", className)} 
      {...doubleTapHandlers}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || "Double tap or Ctrl+Enter to activate"}
    >
      {children}
    </div>
  );
};