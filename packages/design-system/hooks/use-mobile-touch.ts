'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect mobile devices and provide touch-optimized sizing
 * Ensures minimum 44px touch targets on mobile devices
 */
export function useMobileTouch() {
  const [isMobile, setIsMobile] = useState(false);
  const [touchOptimized, setTouchOptimized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|iemobile/i.test(
          userAgent
        );
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;

      const mobile = isMobileDevice || (hasTouch && isSmallScreen);
      setIsMobile(mobile);
      setTouchOptimized(mobile || hasTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get mobile-optimized button size
  const getMobileButtonSize = (defaultSize = 'default') => {
    if (!touchOptimized) return defaultSize;

    switch (defaultSize) {
      case 'sm':
        return 'mobile';
      case 'default':
        return 'mobile';
      case 'lg':
        return 'mobile-lg';
      case 'icon':
        return 'mobile-icon';
      default:
        return touchOptimized ? 'mobile' : defaultSize;
    }
  };

  // Get mobile-optimized classes for touch targets
  const getTouchTargetClasses = (baseClasses = '') => {
    const mobileClasses = touchOptimized
      ? 'min-h-[44px] min-w-[44px] touch-manipulation'
      : '';

    return `${baseClasses} ${mobileClasses}`.trim();
  };

  return {
    isMobile,
    touchOptimized,
    getMobileButtonSize,
    getTouchTargetClasses,
  };
}

/**
 * Utility function to get mobile-optimized size without hook
 * Useful for server-side rendering
 */
export function getMobileSafeSize(size: string, forceOptimize = false) {
  if (!forceOptimize && typeof window === 'undefined') return size;

  const shouldOptimize =
    forceOptimize ||
    (typeof window !== 'undefined' &&
      (window.innerWidth <= 768 || 'ontouchstart' in window));

  if (!shouldOptimize) return size;

  switch (size) {
    case 'sm':
      return 'mobile';
    case 'default':
      return 'mobile';
    case 'lg':
      return 'mobile-lg';
    case 'icon':
      return 'mobile-icon';
    default:
      return 'mobile';
  }
}
