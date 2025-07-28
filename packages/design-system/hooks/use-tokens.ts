import { useCallback, useMemo } from 'react';
import tokens, {
  type AnimationDuration,
  type AnimationEasing,
  applyTokens,
  type BorderRadiusSize,
  type FontSize,
  type ShadowSize,
  type SpacingSize,
  type TouchTargetSize,
} from '../lib/tokens';

/**
 * Hook to access design tokens in React components
 * Provides type-safe access to all token values and helper functions
 */
export function useTokens() {
  // Memoize token objects to prevent recreating on each render
  const tokenValues = useMemo(
    () => ({
      touchTargets: tokens.touchTargets,
      spacing: tokens.spacing,
      mobileInteractions: tokens.mobileInteractions,
      typography: tokens.typography,
      borderRadius: tokens.borderRadius,
      shadows: tokens.shadows,
      animations: tokens.animations,
      breakpoints: tokens.breakpoints,
      zIndex: tokens.zIndex,
    }),
    []
  );

  // Helper to get touch target styles
  const getTouchTarget = useCallback(
    (size: TouchTargetSize) => applyTokens.touchTarget(size),
    []
  );

  // Helper to get spacing value
  const getSpacing = useCallback(
    (size: SpacingSize) => applyTokens.spacing(size),
    []
  );

  // Helper to get safe area value
  const getSafeArea = useCallback(
    (side?: 'top' | 'bottom' | 'left' | 'right') => applyTokens.safeArea(side),
    []
  );

  // Helper to get font size
  const getFontSize = useCallback(
    (size: FontSize) => applyTokens.fontSize(size),
    []
  );

  // Helper to get shadow
  const getShadow = useCallback(
    (size: ShadowSize) => applyTokens.shadow(size),
    []
  );

  // Helper to get border radius
  const getRadius = useCallback(
    (size: BorderRadiusSize) => applyTokens.radius(size),
    []
  );

  // Helper to get animation properties
  const getAnimation = useCallback(
    (duration: AnimationDuration, easing?: AnimationEasing) =>
      applyTokens.animation(duration, easing),
    []
  );

  // Check if current viewport matches breakpoint
  const matchesBreakpoint = useCallback(
    (breakpoint: keyof typeof tokens.breakpoints) => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(
        `(min-width: ${tokens.breakpoints[breakpoint]}px)`
      ).matches;
    },
    []
  );

  // Get CSS variable value
  const getCSSVariable = useCallback((variable: string) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(
      `--${variable}`
    );
  }, []);

  return {
    // Token values
    ...tokenValues,

    // Helper functions
    getTouchTarget,
    getSpacing,
    getSafeArea,
    getFontSize,
    getShadow,
    getRadius,
    getAnimation,
    matchesBreakpoint,
    getCSSVariable,

    // Tailwind classes
    tailwind: tokens.tailwindTokens,
  };
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get safe animation duration based on user preferences
 */
export function useSafeAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations } = useTokens();

  const getSafeDuration = useCallback(
    (duration: AnimationDuration) => {
      if (prefersReducedMotion) return 0;
      return animations.duration[duration];
    },
    [prefersReducedMotion, animations.duration]
  );

  return { getSafeDuration, prefersReducedMotion };
}
