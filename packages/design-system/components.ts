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
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb';
export { Button, buttonVariants } from './components/ui/button';
export { Calendar } from './components/ui/calendar';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './components/ui/carousel';
export type { CarouselApi } from './components/ui/carousel';
export { Checkbox } from './components/ui/checkbox';
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
export { Skeleton } from './components/ui/skeleton';
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
  threadlyTrustFeatures 
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

// Hooks
export { useIsMobile } from './hooks/use-mobile';
export { usePullToRefresh } from './hooks/use-pull-to-refresh';

// Utils
export { cn } from './lib/utils';