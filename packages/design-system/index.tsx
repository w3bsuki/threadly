import type { ThemeProviderProps } from 'next-themes';
import { AppErrorProvider } from './components/error-boundaries';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

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

// Export toast functionality
export { toast } from 'sonner';
// Export error boundaries for production-grade error handling
export {
  APIErrorBoundary,
  APIErrorProvider,
  AppErrorBoundary,
  AppErrorProvider,
  PaymentErrorBoundary,
  PaymentErrorProvider,
  ProductErrorBoundary,
  ProductErrorProvider,
} from './components/error-boundaries';
export {
  Animated,
  HoverCard,
  PageTransition,
  StaggerContainer,
} from './components/ui/animated';
export { Banner } from './components/ui/banner';
// Export additional components
export {
  ServiceWorkerRegistration,
  useServiceWorker,
} from './components/ui/service-worker-registration';
export {
  useImageLoadingState,
  useLazyLoadImages,
  useVirtualImageList,
} from './hooks/use-lazy-load-images';
export { getMobileSafeSize, useMobileTouch } from './hooks/use-mobile-touch';
export {
  animationDelays,
  animations,
  hoverAnimations,
  loadingAnimations,
  staggerAnimation,
} from './lib/animations';

// Export commonly used utilities
export { cn, capitalize, handleError } from './lib/utils';

// Export commonly used components for convenience
export { Button } from './components/ui/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Skeleton } from './components/ui/skeleton';
export { ModeToggle } from './components/mode-toggle';

// Re-export all components for convenience (when importing from @repo/ui)
export * from './components';
