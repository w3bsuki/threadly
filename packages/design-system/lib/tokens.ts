/**
 * Mobile-first design tokens for Threadly's e-commerce platform
 * These tokens ensure consistency across web and app platforms
 * All values follow an 8-point grid system for visual harmony
 */

// Touch target size tokens - optimized for mobile interactions
export const touchTargets = {
  xs: 36, // Dense product cards, compact lists
  sm: 40, // Standard buttons, form inputs
  md: 44, // Primary CTAs, recommended minimum for accessibility
  lg: 48, // Checkout actions, critical user flows
  xl: 56, // Mobile bottom bar CTAs, prominent actions
} as const;

// Spacing tokens - 8-point grid system
export const spacing = {
  0: 0,
  1: 4, // space-1: 4px
  2: 8, // space-2: 8px
  3: 12, // space-3: 12px
  4: 16, // space-4: 16px
  5: 20, // space-5: 20px
  6: 24, // space-6: 24px
  8: 32, // space-8: 32px
  10: 40, // space-10: 40px
  12: 48, // space-12: 48px
  16: 64, // space-16: 64px
} as const;

// Mobile-specific interaction tokens
export const mobileInteractions = {
  safeAreaBottom: 'env(safe-area-inset-bottom)',
  safeAreaTop: 'env(safe-area-inset-top)',
  safeAreaLeft: 'env(safe-area-inset-left)',
  safeAreaRight: 'env(safe-area-inset-right)',
  thumbReach: '60vh', // Comfortable thumb zone
  swipeThreshold: 80, // Minimum swipe distance in pixels
  hapticDuration: 10, // Haptic feedback duration in ms
  tapDelay: 100, // Delay before tap action to prevent accidental taps
  doubleTapThreshold: 300, // Maximum time between taps for double-tap
} as const;

// Typography scale - mobile optimized
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// Border radius tokens
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Shadow tokens - elevation system
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Animation tokens
export const animations = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Breakpoints - mobile-first approach
export const breakpoints = {
  xs: 375, // Small phones
  sm: 640, // Large phones
  md: 768, // Tablets
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
  '2xl': 1536, // Extra large screens
} as const;

// Z-index layers
export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
  commandPalette: 80,
} as const;

// Generate CSS custom properties
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // Touch targets
  Object.entries(touchTargets).forEach(([key, value]) => {
    cssVars[`--touch-target-${key}`] = `${value}px`;
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--space-${key}`] = `${value}px`;
  });

  // Mobile interactions
  cssVars['--safe-area-bottom'] = mobileInteractions.safeAreaBottom;
  cssVars['--safe-area-top'] = mobileInteractions.safeAreaTop;
  cssVars['--safe-area-left'] = mobileInteractions.safeAreaLeft;
  cssVars['--safe-area-right'] = mobileInteractions.safeAreaRight;
  cssVars['--thumb-reach'] = mobileInteractions.thumbReach;
  cssVars['--swipe-threshold'] = `${mobileInteractions.swipeThreshold}px`;
  cssVars['--haptic-duration'] = `${mobileInteractions.hapticDuration}ms`;

  // Typography
  Object.entries(typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = `${value}px`;
  });

  Object.entries(typography.lineHeight).forEach(([key, value]) => {
    cssVars[`--line-height-${key}`] = `${value}`;
  });

  Object.entries(typography.fontWeight).forEach(([key, value]) => {
    cssVars[`--font-weight-${key}`] = `${value}`;
  });

  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = `${value}px`;
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });

  // Animations
  Object.entries(animations.duration).forEach(([key, value]) => {
    cssVars[`--duration-${key}`] = `${value}ms`;
  });

  Object.entries(animations.easing).forEach(([key, value]) => {
    cssVars[`--ease-${key}`] = value;
  });

  // Z-index
  Object.entries(zIndex).forEach(([key, value]) => {
    cssVars[`--z-${key}`] = `${value}`;
  });

  return cssVars;
};

// Helper function to apply tokens in styles
export const applyTokens = {
  touchTarget: (size: keyof typeof touchTargets) => ({
    minHeight: `${touchTargets[size]}px`,
    minWidth: `${touchTargets[size]}px`,
  }),

  spacing: (size: keyof typeof spacing) => `${spacing[size]}px`,

  safeArea: (side: 'top' | 'bottom' | 'left' | 'right' = 'bottom') => {
    const key =
      `safeArea${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof typeof mobileInteractions;
    return mobileInteractions[key];
  },

  fontSize: (size: keyof typeof typography.fontSize) =>
    `${typography.fontSize[size]}px`,

  shadow: (size: keyof typeof shadows) => shadows[size],

  radius: (size: keyof typeof borderRadius) => `${borderRadius[size]}px`,

  animation: (
    duration: keyof typeof animations.duration,
    easing: keyof typeof animations.easing = 'easeInOut'
  ) => ({
    transitionDuration: `${animations.duration[duration]}ms`,
    transitionTimingFunction: animations.easing[easing],
  }),
};

// Tailwind CSS utility classes for tokens
export const tailwindTokens = {
  touchTargets: {
    xs: 'min-h-[36px] min-w-[36px]',
    sm: 'min-h-[40px] min-w-[40px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[48px] min-w-[48px]',
    xl: 'min-h-[56px] min-w-[56px]',
  },
  safeArea: {
    bottom: 'pb-[env(safe-area-inset-bottom)]',
    top: 'pt-[env(safe-area-inset-top)]',
    left: 'pl-[env(safe-area-inset-left)]',
    right: 'pr-[env(safe-area-inset-right)]',
    all: 'p-[env(safe-area-inset-bottom)_env(safe-area-inset-right)_env(safe-area-inset-top)_env(safe-area-inset-left)]',
  },
  thumbReach: 'max-h-[60vh]',
} as const;

// Export token types for TypeScript
export type TouchTargetSize = keyof typeof touchTargets;
export type SpacingSize = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type ShadowSize = keyof typeof shadows;
export type BorderRadiusSize = keyof typeof borderRadius;
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
export type Breakpoint = keyof typeof breakpoints;
export type ZIndexLayer = keyof typeof zIndex;

// Default export all tokens
export default {
  touchTargets,
  spacing,
  mobileInteractions,
  typography,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  generateCSSVariables,
  applyTokens,
  tailwindTokens,
};
