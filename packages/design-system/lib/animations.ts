// Animation variants for consistent motion throughout the app
export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-2 duration-300',
  fadeInDown: 'animate-in fade-in slide-in-from-top-2 duration-300',
  fadeInLeft: 'animate-in fade-in slide-in-from-right-2 duration-300',
  fadeInRight: 'animate-in fade-in slide-in-from-left-2 duration-300',

  // Slide animations
  slideInTop: 'animate-in slide-in-from-top duration-300',
  slideInBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  slideInRight: 'animate-in slide-in-from-right duration-300',
  slideOutTop: 'animate-out slide-out-to-top duration-300',
  slideOutBottom: 'animate-out slide-out-to-bottom duration-300',
  slideOutLeft: 'animate-out slide-out-to-left duration-300',
  slideOutRight: 'animate-out slide-out-to-right duration-300',

  // Zoom animations
  zoomIn: 'animate-in zoom-in-95 duration-300',
  zoomOut: 'animate-out zoom-out-95 duration-300',
  zoomInBounce: 'animate-in zoom-in-95 duration-500 ease-bounce',

  // Spin animations
  spin: 'animate-spin',
  spinSlow: 'animate-spin duration-[3s]',
  ping: 'animate-ping',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',

  // Page transitions
  pageEnter: 'animate-in fade-in duration-500',
  pageExit: 'animate-out fade-out duration-300',

  // Modal/Dialog animations
  modalBackdrop: 'animate-in fade-in duration-300',
  modalContent: 'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300',
  modalExit: 'animate-out fade-out zoom-out-95 slide-out-to-bottom-4 duration-200',

  // Accordion animations
  accordionDown: 'animate-accordion-down',
  accordionUp: 'animate-accordion-up',

  // List item stagger
  listItem: 'animate-in fade-in slide-in-from-left-2',

  // Skeleton loading
  skeleton: 'animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent',

  // Button hover states
  buttonHover: 'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
  buttonPress: 'transition-transform duration-100 active:scale-95',

  // Card animations
  cardHover: 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
  cardPress: 'transition-transform duration-100 active:scale-[0.98]',

  // Image animations
  imageLoad: 'transition-opacity duration-300',
  imageHover: 'transition-transform duration-300 hover:scale-105',

  // Badge animations
  badgePulse: 'animate-pulse',
  badgeBounce: 'animate-bounce',

  // Custom spring animations
  springIn: 'transition-all duration-500 ease-spring',
  springOut: 'transition-all duration-300 ease-out',
} as const;

// Animation delay utilities
export const animationDelays = {
  0: '',
  100: 'animation-delay-100',
  200: 'animation-delay-200',
  300: 'animation-delay-300',
  400: 'animation-delay-400',
  500: 'animation-delay-500',
  600: 'animation-delay-600',
  700: 'animation-delay-700',
  800: 'animation-delay-800',
  900: 'animation-delay-900',
  1000: 'animation-delay-1000',
} as const;

// Stagger animation helper
export function staggerAnimation(index: number, baseDelay = 50) {
  return {
    animationDelay: `${index * baseDelay}ms`,
  };
}

// Page transition variants for framer-motion compatibility
export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// List animation variants
export const listAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  },
};

// Hover animation presets
export const hoverAnimations = {
  scale: 'hover:scale-105 transition-transform duration-200',
  lift: 'hover:-translate-y-1 transition-transform duration-200',
  glow: 'hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300',
  borderGlow: 'hover:ring-2 hover:ring-primary/50 transition-all duration-200',
};

// Loading animation variants
export const loadingAnimations = {
  dots: 'animate-pulse',
  spinner: 'animate-spin',
  skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer',
  progressBar: 'animate-progress',
};

// Notification animations
export const notificationAnimations = {
  enter: 'animate-in slide-in-from-top fade-in duration-300',
  exit: 'animate-out slide-out-to-top fade-out duration-200',
  shake: 'animate-shake',
};