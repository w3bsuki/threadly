/**
 * Optimized component exports for tree-shaking
 * Export components individually instead of using barrel exports
 * This allows Next.js to better optimize imports
 */

export { toast } from 'sonner';
export type { BrandButtonVariant } from './components/brand';
// Brand components - Threadly marketplace specific
export {
  AccessoriesIcon,
  BRAND_BUTTON_VARIANTS,
  BrandButtonShowcase,
  BrandIconShowcase,
  brandButtonExamples,
  ConditionStars,
  DesignerTag,
  DressIcon,
  FashionHanger,
  HeartAnimation,
  PremiumBadge,
  QuickViewIcon,
  SecurePaymentIcon,
  ShirtIcon,
  ShoesIcon,
  THREADLY_BRAND_COLORS,
  ThreadlyIcons,
  ThreadlyLogo,
  VerifiedBadge,
} from './components/brand';
export type {
  CartEmptyProps,
  CartItemProps,
  CartQuantitySelectorProps,
  CartSummaryProps,
} from './components/cart';
// Cart components - Shopping cart UI components
export {
  CartEmpty,
  CartItem,
  CartQuantitySelector,
  CartSummary,
} from './components/cart';
// Commerce components - E-commerce specific skeletons
export {
  CartSkeleton,
  CategoryGridSkeleton,
  CheckoutSkeleton,
  HeroSkeleton,
  OrderListSkeleton,
  ProductCardSkeleton,
  ProductDetailSkeleton,
  ProductGridSkeleton,
  TrendingProductsSkeleton,
} from './components/commerce';
export type { MobileProductCardProps } from './components/commerce/mobile-product-card';
// Mobile commerce components
export {
  MobileProductCard,
  MobileProductCardSkeleton,
  MobileProductGrid,
} from './components/commerce/mobile-product-card';
export {
  APIErrorBoundary,
  AppErrorBoundary,
  PaymentErrorBoundary,
  ProductErrorBoundary,
} from './components/error-boundaries';
// Feedback components - Loading states and skeletons
export {
  DashboardSkeleton,
  ListSkeleton,
  LoadingButton,
  LoadingSpinner,
  NotificationSkeleton,
  PageLoadingOverlay,
  ProfileSkeleton,
  TableSkeleton,
} from './components/feedback';
export type {
  MarketplaceTrustSectionProps,
  ProductCardProps,
  ProductData,
  ProductImageGalleryProps,
  ProductImageProps,
  SellerData,
  SellerProfileProps,
  SellerStats,
  TrustBadgeCollectionProps,
  TrustBadgeProps,
} from './components/marketplace';
// Marketplace components - Production-ready marketplace features
export {
  ConditionBadge,
  MarketplaceTrustSection,
  ProductCard,
  ProductGrid,
  ProductImage,
  ProductImageGallery,
  SellerProfile,
  TrustBadge,
  TrustBadgeCollection,
  threadlyTrustFeatures,
} from './components/marketplace';
// Messaging components - Chat and communication skeletons
export {
  ChatInputSkeleton,
  ConversationSkeleton,
  MessageBubbleSkeleton,
  MessageListSkeleton,
} from './components/messaging';
// Mobile components - Touch interactions and gestures
export {
  hapticFeedback,
  MobileInteractions,
  ReachabilityZone,
  useDoubleTap,
  useLongPress,
  usePullToRefresh,
  useSwipeGesture,
} from './components/mobile/mobile-interactions';
// Custom components
export { ModeToggle } from './components/mode-toggle';
export type { OptimizedImageProps } from './components/optimized-image';
export { OptimizedImage } from './components/optimized-image';
// Search components - Search interface skeletons
export {
  SearchFiltersSkeleton,
  SearchInputSkeleton,
  SearchResultsSkeleton,
  SearchSuggestionsSkeleton,
} from './components/search';
// UI Components - Export individually for better tree-shaking
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './components/ui/accordion';
export { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './components/ui/alert-dialog';
export { AspectRatio } from './components/ui/aspect-ratio';
export { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export { Banner } from './components/ui/banner';
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb';
export { Button, buttonVariants } from './components/ui/button';
export { Calendar } from './components/ui/calendar';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
export type { CarouselApi } from './components/ui/carousel';
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './components/ui/carousel';
export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './components/ui/chart';
export { Checkbox } from './components/ui/checkbox';
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './components/ui/collapsible';
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './components/ui/command';
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './components/ui/context-menu';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './components/ui/drawer';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
// Error boundaries
export {
  ErrorBoundary,
  withErrorBoundary,
} from './components/ui/error-boundary';
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './components/ui/form';
export {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './components/ui/hover-card';
export { Input } from './components/ui/input';
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './components/ui/input-otp';
export { Label } from './components/ui/label';
export type {
  LazyAvatarProps,
  LazyImageProps,
} from './components/ui/lazy-image';
export { LazyAvatar, LazyImage } from './components/ui/lazy-image';
// Unified loading skeletons
export {
  DashboardSkeleton as UnifiedDashboardSkeleton,
  LoadingSkeleton,
  MessagesSkeleton,
  ProductListingSkeleton,
} from './components/ui/loading-skeleton';
export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './components/ui/menubar';
export type {
  AnimatedCartButtonProps,
  AnimatedHeartButtonProps,
  AnimatedRatingStarsProps,
  FloatingActionButtonProps,
  StaggerContainerProps,
} from './components/ui/micro-interactions';
// Micro-interactions for enhanced UX
export {
  AnimatedCartButton,
  AnimatedHeartButton,
  AnimatedRatingStars,
  CartFloatAnimation,
  FloatingActionButton,
  LoadingDots,
  StaggerContainer,
} from './components/ui/micro-interactions';
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './components/ui/navigation-menu';
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './components/ui/pagination';
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover';
export { Progress } from './components/ui/progress';
export {
  PullToRefreshIndicator,
  PullToRefreshWrapper,
} from './components/ui/pull-to-refresh';
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable';
export { ScrollArea, ScrollBar } from './components/ui/scroll-area';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
export { Separator } from './components/ui/separator';
export {
  ServiceWorkerRegistration,
  useServiceWorker,
} from './components/ui/service-worker-registration';
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './components/ui/sidebar';
export {
  Skeleton,
  SkeletonAvatar,
  SkeletonShimmer,
  SkeletonText,
} from './components/ui/skeleton';
export { Slider } from './components/ui/slider';
export { Toaster } from './components/ui/sonner';
export { Switch } from './components/ui/switch';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
export { Textarea } from './components/ui/textarea';
export { Toggle, toggleVariants } from './components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';
export type {
  ImageData,
  ImageGalleryProps,
  ImagePreviewProps,
  ImageUploadProps,
  UploadFile,
  UploadProgressProps,
  UploadResult,
} from './components/upload';
// Upload components - Image upload with drag & drop
export {
  ImageGallery,
  ImagePreview,
  ImageUpload,
  UploadProgress,
} from './components/upload';
export type { UploadthingImageUploadProps } from './components/upload/uploadthing-image-upload';
export { UploadthingImageUpload } from './components/upload/uploadthing-image-upload';
export type {
  FormWizardProps,
  FormWizardStep,
  MultiStepWizardProps,
  WizardStep as WizardStepConfig,
  WizardStepProps,
} from './components/wizard';

// Wizard components - Multi-step form wizards
export {
  ConditionalWizardStep,
  FormWizard,
  FormWizardField,
  MultiStepWizard,
  useFormWizard,
  useWizard,
  useWizardKeyboardNavigation,
  WizardCard,
  WizardError,
  WizardFieldGroup,
  WizardFormStep,
  WizardInfo,
  WizardMobileNavigation,
  WizardNavigation,
  WizardProgress,
  WizardReviewStep,
  // WizardStep, // Commenting out due to type conflict
  WizardStepContainer,
  WizardStepGroup,
  WizardStepIndicator,
  WizardSuccess,
  WizardSummary,
} from './components/wizard';
// Hooks
export { useIsMobile } from './hooks/use-mobile';
export { usePullToRefresh as usePullToRefreshLegacy } from './hooks/use-pull-to-refresh';
export {
  usePrefersReducedMotion,
  useSafeAnimation,
  useTokens,
} from './hooks/use-tokens';
// Navigation utilities
export {
  CATEGORIES,
  type Category,
  footerLinks,
  mainNavigationLinks,
  type NavigationLink,
  type NavigationSection,
  quickLinks,
  type Subcategory,
} from './lib/navigation-utils';
export type {
  AnimationDuration,
  AnimationEasing,
  BorderRadiusSize,
  Breakpoint,
  FontSize,
  ShadowSize,
  SpacingSize,
  TouchTargetSize,
  ZIndexLayer,
} from './lib/tokens';

// Design Tokens
export {
  animations,
  applyTokens,
  borderRadius,
  breakpoints,
  default as tokens,
  generateCSSVariables,
  mobileInteractions,
  shadows,
  spacing,
  tailwindTokens,
  touchTargets,
  typography,
  zIndex,
} from './lib/tokens';
// Utils
export { cn } from './lib/utils';
