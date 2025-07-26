/**
 * Platform detection and safe area utilities
 * Following CONTEXT.md cross-platform patterns
 */

export const platform = {
  get isIOS() {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  get isAndroid() {
    if (typeof navigator === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  },
  
  hasNotch: () => {
    if (typeof window === 'undefined') return false;
    
    // Check for iOS safe areas
    const hasNotch = 
      CSS.supports('padding-top: env(safe-area-inset-top)') &&
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          'env(safe-area-inset-top)'
        )
      ) > 0;
    return hasNotch;
  },
  
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined') {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
  },
};

/**
 * Screen reader announcement utility
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};