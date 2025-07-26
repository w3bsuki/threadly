/**
 * Optimized component exports for tree-shaking
 * Export components individually instead of using barrel exports
 * This allows Next.js to better optimize imports
 */

// UI Components - Export individually for better tree-shaking
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
export { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';
export { AspectRatio } from './components/ui/aspect-ratio';
export { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export { Banner } from './components/ui/banner';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb';
export { Button, buttonVariants } from './components/ui/button';
export { Calendar } from './components/ui/calendar';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './components/ui/carousel';
export type { CarouselApi } from './components/ui/carousel';
export { Checkbox } from './components/ui/checkbox';
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './components/ui/chart';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './components/ui/command';
export { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from './components/ui/context-menu';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './components/ui/drawer';
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './components/ui/dropdown-menu';
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './components/ui/form';
export { HoverCard, HoverCardContent, HoverCardTrigger } from './components/ui/hover-card';
export { Input } from './components/ui/input';
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './components/ui/input-otp';
export { Label } from './components/ui/label';
export { LazyImage, LazyAvatar } from './components/ui/lazy-image';
export type { LazyImageProps, LazyAvatarProps } from './components/ui/lazy-image';
export { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from './components/ui/menubar';
export { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from './components/ui/navigation-menu';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './components/ui/pagination';
export { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
export { Progress } from './components/ui/progress';
export { PullToRefreshIndicator, PullToRefreshWrapper } from './components/ui/pull-to-refresh';
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable';
export { ScrollArea, ScrollBar } from './components/ui/scroll-area';
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './components/ui/select';
export { Separator } from './components/ui/separator';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from './components/ui/sidebar';
export { Skeleton, SkeletonShimmer, SkeletonText, SkeletonAvatar } from './components/ui/skeleton';
export { Slider } from './components/ui/slider';
export { Toaster } from './components/ui/sonner';
export { toast } from 'sonner';
export { Switch } from './components/ui/switch';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './components/ui/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
export { Textarea } from './components/ui/textarea';
export { Toggle, toggleVariants } from './components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';

// Custom components
export { ModeToggle } from './components/mode-toggle';
export { OptimizedImage } from './components/optimized-image';
export type { OptimizedImageProps } from './components/optimized-image';
export { ServiceWorkerRegistration, useServiceWorker } from './components/ui/service-worker-registration';

// Micro-interactions for enhanced UX
export { 
  AnimatedHeartButton,
  AnimatedCartButton,
  AnimatedRatingStars,
  FloatingActionButton,
  LoadingDots,
  StaggerContainer,
  CartFloatAnimation
} from './components/ui/micro-interactions';
export type {
  AnimatedHeartButtonProps,
  AnimatedCartButtonProps,
  AnimatedRatingStarsProps,
  FloatingActionButtonProps,
  StaggerContainerProps
} from './components/ui/micro-interactions';

// Brand components - Threadly marketplace specific
export { 
  BrandButtonShowcase, 
  brandButtonExamples,
  BrandIconShowcase,
  ThreadlyIcons,
  ThreadlyLogo,
  PremiumBadge,
  VerifiedBadge,
  FashionHanger,
  DesignerTag,
  ConditionStars,
  DressIcon,
  ShirtIcon,
  ShoesIcon,
  AccessoriesIcon,
  HeartAnimation,
  QuickViewIcon,
  SecurePaymentIcon,
  THREADLY_BRAND_COLORS, 
  BRAND_BUTTON_VARIANTS 
} from './components/brand';
export type { BrandButtonVariant } from './components/brand';

// Error boundaries
export { ErrorBoundary, withErrorBoundary } from './components/ui/error-boundary';
export { AppErrorBoundary, PaymentErrorBoundary, ProductErrorBoundary, APIErrorBoundary } from './components/error-boundaries';

// Marketplace components - Production-ready marketplace features
export { 
  ProductCard, 
  ProductGrid, 
  ProductImage,
  ProductImageGallery,
  SellerProfile, 
  TrustBadge, 
  TrustBadgeCollection, 
  MarketplaceTrustSection,
  threadlyTrustFeatures,
  ConditionBadge
} from './components/marketplace';
export type { 
  ProductCardProps, 
  ProductImageProps,
  ProductImageGalleryProps,
  SellerProfileProps, 
  TrustBadgeProps, 
  TrustBadgeCollectionProps, 
  MarketplaceTrustSectionProps,
  ProductData,
  SellerData,
  SellerStats
} from './components/marketplace';

// Mobile components - Touch interactions and gestures
export { 
  MobileInteractions,
  ReachabilityZone,
  hapticFeedback,
  usePullToRefresh,
  useSwipeGesture,
  useLongPress,
  useDoubleTap
} from './components/mobile/mobile-interactions';

// Hooks
export { useIsMobile } from './hooks/use-mobile';
export { usePullToRefresh as usePullToRefreshLegacy } from './hooks/use-pull-to-refresh';
export { useTokens, usePrefersReducedMotion, useSafeAnimation } from './hooks/use-tokens';

// Feedback components - Loading states and skeletons
export { 
  LoadingSpinner,
  LoadingButton,
  PageLoadingOverlay,
  ListSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  DashboardSkeleton,
  NotificationSkeleton
} from './components/feedback';

// Unified loading skeletons
export { 
  LoadingSkeleton,
  ProductListingSkeleton,
  MessagesSkeleton,
  DashboardSkeleton as UnifiedDashboardSkeleton
} from './components/ui/loading-skeleton';

// Commerce components - E-commerce specific skeletons
export {
  ProductCardSkeleton,
  ProductGridSkeleton,
  ProductDetailSkeleton,
  CartSkeleton,
  CheckoutSkeleton,
  OrderListSkeleton,
  CategoryGridSkeleton,
  TrendingProductsSkeleton,
  HeroSkeleton
} from './components/commerce';

// Mobile commerce components
export {
  MobileProductCard,
  MobileProductCardSkeleton,
  MobileProductGrid
} from './components/commerce/mobile-product-card';
export type { MobileProductCardProps } from './components/commerce/mobile-product-card';

// Messaging components - Chat and communication skeletons
export {
  MessageListSkeleton,
  ConversationSkeleton,
  ChatInputSkeleton,
  MessageBubbleSkeleton
} from './components/messaging';

// Search components - Search interface skeletons
export {
  SearchResultsSkeleton,
  SearchInputSkeleton,
  SearchSuggestionsSkeleton,
  SearchFiltersSkeleton
} from './components/search';

// Utils
export { cn } from './lib/utils';

// Cart components - Shopping cart UI components
export {
  CartItem,
  CartSummary,
  CartEmpty,
  CartQuantitySelector
} from './components/cart';
export type {
  CartItemProps,
  CartSummaryProps,
  CartEmptyProps,
  CartQuantitySelectorProps
} from './components/cart';

// Navigation utilities
export { 
  CATEGORIES,
  mainNavigationLinks,
  quickLinks,
  footerLinks,
  type Category,
  type Subcategory,
  type NavigationLink,
  type NavigationSection
} from './lib/navigation-utils';

// Wizard components - Multi-step form wizards
export {
  MultiStepWizard,
  WizardProgress,
  WizardNavigation,
  WizardStepIndicator,
  // WizardStep, // Commenting out due to type conflict
  WizardStepContainer,
  WizardFormStep,
  WizardReviewStep,
  WizardStepGroup,
  ConditionalWizardStep,
  FormWizard,
  WizardCard,
  WizardSummary,
  WizardInfo,
  WizardSuccess,
  WizardError,
  WizardFieldGroup,
  WizardMobileNavigation,
  useWizard,
  useFormWizard,
  useWizardKeyboardNavigation,
  FormWizardField,
} from './components/wizard';
export type {
  WizardStep as WizardStepConfig,
  MultiStepWizardProps,
  WizardStepProps,
  FormWizardStep,
  FormWizardProps,
} from './components/wizard';

// Upload components - Image upload with drag & drop
export {
  ImageUpload,
  ImagePreview,
  ImageGallery,
  UploadProgress,
} from './components/upload';
export { UploadthingImageUpload } from './components/upload/uploadthing-image-upload';
export type {
  ImageData,
  UploadResult,
  UploadFile,
  ImageUploadProps,
  ImagePreviewProps,
  ImageGalleryProps,
  UploadProgressProps,
} from './components/upload';
export type { UploadthingImageUploadProps } from './components/upload/uploadthing-image-upload';

// Design Tokens
export {
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
  default as tokens
} from './lib/tokens';
export type {
  TouchTargetSize,
  SpacingSize,
  FontSize,
  ShadowSize,
  BorderRadiusSize,
  AnimationDuration,
  AnimationEasing,
  Breakpoint,
  ZIndexLayer
} from './lib/tokens';