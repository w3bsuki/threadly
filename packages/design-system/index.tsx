import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';
import { AppErrorProvider } from './components/error-boundaries';

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <AppErrorProvider>
    <ThemeProvider {...properties}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  </AppErrorProvider>
);

// Export additional components
export { ServiceWorkerRegistration, useServiceWorker } from './components/ui/service-worker-registration';
export { Banner } from './components/ui/banner';

// Export toast functionality
export { toast } from 'sonner';
export { useLazyLoadImages, useImageLoadingState, useVirtualImageList } from './hooks/use-lazy-load-images';
export { Animated, StaggerContainer, PageTransition, HoverCard } from './components/ui/animated';
export { animations, animationDelays, staggerAnimation, hoverAnimations, loadingAnimations } from './lib/animations';
export { useMobileTouch, getMobileSafeSize } from './hooks/use-mobile-touch';

// Export error boundaries for production-grade error handling
export {
  AppErrorBoundary,
  AppErrorProvider,
  PaymentErrorBoundary,
  PaymentErrorProvider,
  ProductErrorBoundary,
  ProductErrorProvider,
  APIErrorBoundary,
  APIErrorProvider
} from './components/error-boundaries';
