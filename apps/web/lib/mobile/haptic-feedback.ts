/**
 * Haptic feedback utility for mobile interactions
 * Following CONTEXT.md patterns for mobile performance
 */

export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]); // Pattern vibration
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]); // Triple pulse
    }
  },
};

/**
 * Haptic feedback usage guidelines:
 * - light: Toggle switches, tab changes, minor selections
 * - medium: Button presses, form submissions, navigation
 * - heavy: Destructive actions, important confirmations
 * - success: Order completion, successful saves
 * - error: Validation failures, network errors
 */
