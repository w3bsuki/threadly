// Threadly Brand Components
export { BrandButtonShowcase, brandButtonExamples } from './button-showcase';
export { 
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
} from './icons';

// Re-export button with brand variants
export { Button, buttonVariants } from '../ui/button';

// Brand-specific utilities and constants
export const THREADLY_BRAND_COLORS = {
  primary: 'oklch(0.4 0.2 250)',      // Deep Blue
  secondary: 'oklch(0.8 0.1 120)',    // Green  
  accent: 'oklch(0.6 0.15 40)',       // Orange
  purple: 'oklch(0.5 0.2 300)',       // Purple
  gold: 'oklch(0.7 0.15 85)',         // Premium Gold
} as const;

export const BRAND_BUTTON_VARIANTS = [
  'brand-primary',
  'brand-secondary', 
  'brand-accent',
  'brand-gradient',
  'brand-outline',
  'brand-ghost',
] as const;

export type BrandButtonVariant = typeof BRAND_BUTTON_VARIANTS[number];