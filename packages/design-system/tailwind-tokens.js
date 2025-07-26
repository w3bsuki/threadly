/**
 * Tailwind CSS configuration for design tokens
 * Import this in your tailwind.config.js to use the tokens
 */

const tokens = require('./lib/tokens');

module.exports = {
  theme: {
    extend: {
      spacing: {
        // Add token-based spacing
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        // Touch targets
        'touch-xs': '36px',
        'touch-sm': '40px',
        'touch-md': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
        // Safe areas
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch-xs': '36px',
        'touch-sm': '40px',
        'touch-md': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      minWidth: {
        'touch-xs': '36px',
        'touch-sm': '40px',
        'touch-md': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      maxHeight: {
        'thumb-reach': '60vh',
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'linear': 'linear',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      zIndex: {
        'behind': '-1',
        'base': '0',
        'dropdown': '10',
        'sticky': '20',
        'overlay': '30',
        'modal': '40',
        'popover': '50',
        'tooltip': '60',
        'notification': '70',
        'command': '80',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const touchUtilities = {
        '.touch-xs': {
          minHeight: '36px',
          minWidth: '36px',
        },
        '.touch-sm': {
          minHeight: '40px',
          minWidth: '40px',
        },
        '.touch-md': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-lg': {
          minHeight: '48px',
          minWidth: '48px',
        },
        '.touch-xl': {
          minHeight: '56px',
          minWidth: '56px',
        },
      };

      const safeAreaUtilities = {
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-all': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      };

      const interactionUtilities = {
        '.thumb-reach': {
          maxHeight: '60vh',
        },
        '.haptic': {
          'touch-action': 'manipulation',
          '-webkit-tap-highlight-color': 'transparent',
        },
      };

      addUtilities({
        ...touchUtilities,
        ...safeAreaUtilities,
        ...interactionUtilities,
      });
    },
  ],
};