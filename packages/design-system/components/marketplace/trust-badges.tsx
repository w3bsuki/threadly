'use client';

import {
  Award,
  CheckCircle2,
  Clock,
  Heart,
  RotateCcw,
  Shield,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import type * as React from 'react';
import { cn } from '../../lib/utils';
import { PremiumBadge, SecurePaymentIcon, VerifiedBadge } from '../brand/icons';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

export interface TrustBadgeProps {
  type:
    | 'verified'
    | 'premium'
    | 'fast-shipping'
    | 'top-rated'
    | 'authentic'
    | 'responsive'
    | 'new-arrival'
    | 'trending'
    | 'eco-friendly'
    | 'secure-payment';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'subtle';
  showText?: boolean;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type,
  size = 'md',
  variant = 'default',
  showText = true,
  className,
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'verified':
        return {
          icon: (
            <VerifiedBadge
              size={size === 'sm' ? 12 : size === 'md' ? 16 : 20}
            />
          ),
          text: 'Verified Seller',
          color: 'oklch(var(--verified-badge))',
          bgColor: 'oklch(var(--verified-badge)/.1)',
        };
      case 'premium':
        return {
          icon: (
            <PremiumBadge size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
          ),
          text: 'Premium Member',
          color: 'oklch(var(--premium-gold))',
          bgColor: 'oklch(var(--premium-gold)/.1)',
        };
      case 'fast-shipping':
        return {
          icon: (
            <Truck
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
            />
          ),
          text: 'Fast Shipping',
          color: 'oklch(var(--brand-secondary))',
          bgColor: 'oklch(var(--brand-secondary)/.1)',
        };
      case 'top-rated':
        return {
          icon: (
            <Star
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} fill-current`}
            />
          ),
          text: 'Top Rated',
          color: 'oklch(var(--brand-accent))',
          bgColor: 'oklch(var(--brand-accent)/.1)',
        };
      case 'authentic':
        return {
          icon: (
            <ShieldCheck
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
            />
          ),
          text: 'Authentic',
          color: 'oklch(var(--brand-primary))',
          bgColor: 'oklch(var(--brand-primary)/.1)',
        };
      case 'responsive':
        return {
          icon: (
            <Clock
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
            />
          ),
          text: 'Quick Response',
          color: 'oklch(var(--brand-purple))',
          bgColor: 'oklch(var(--brand-purple)/.1)',
        };
      case 'new-arrival':
        return {
          icon: (
            <Zap
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
            />
          ),
          text: 'New Arrival',
          color: 'oklch(var(--brand-secondary))',
          bgColor: 'oklch(var(--success-gentle))',
        };
      case 'trending':
        return {
          icon: (
            <Heart
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} fill-current`}
            />
          ),
          text: 'Trending',
          color: 'oklch(var(--brand-accent))',
          bgColor: 'oklch(var(--brand-accent)/.1)',
        };
      case 'eco-friendly':
        return {
          icon: (
            <CheckCircle2
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
            />
          ),
          text: 'Eco-Friendly',
          color: 'oklch(var(--brand-secondary))',
          bgColor: 'oklch(var(--success-gentle))',
        };
      case 'secure-payment':
        return {
          icon: (
            <SecurePaymentIcon
              size={size === 'sm' ? 12 : size === 'md' ? 16 : 20}
            />
          ),
          text: 'Secure Payment',
          color: 'oklch(var(--brand-primary))',
          bgColor: 'oklch(var(--brand-primary)/.1)',
        };
      default:
        return {
          icon: (
            <Shield
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
            />
          ),
          text: 'Trusted',
          color: 'oklch(var(--muted-foreground))',
          bgColor: 'oklch(var(--muted)/.5)',
        };
    }
  };

  const config = getBadgeConfig();

  const badgeClasses = cn(
    'inline-flex items-center gap-1 font-medium transition-all duration-200',
    {
      'px-2 py-1 text-xs': size === 'sm',
      'px-2.5 py-1.5 text-sm': size === 'md',
      'px-3 py-2 text-base': size === 'lg',
      'border-0': variant === 'default',
      border: variant === 'outline',
      'bg-transparent': variant === 'subtle',
    },
    className
  );

  const badgeStyle = {
    color: config.color,
    backgroundColor: variant === 'subtle' ? 'transparent' : config.bgColor,
    borderColor: variant === 'outline' ? config.color : 'transparent',
  };

  return (
    <Badge className={badgeClasses} style={badgeStyle}>
      {config.icon}
      {showText && <span>{config.text}</span>}
    </Badge>
  );
};

// Trust Badge Collection Component
export interface TrustBadgeCollectionProps {
  badges: Array<{
    type: TrustBadgeProps['type'];
    priority?: number;
  }>;
  maxVisible?: number;
  size?: TrustBadgeProps['size'];
  variant?: TrustBadgeProps['variant'];
  layout?: 'horizontal' | 'vertical' | 'grid';
  showText?: boolean;
  className?: string;
}

export const TrustBadgeCollection: React.FC<TrustBadgeCollectionProps> = ({
  badges,
  maxVisible = 5,
  size = 'md',
  variant = 'default',
  layout = 'horizontal',
  showText = true,
  className,
}) => {
  // Sort badges by priority (higher priority first)
  const sortedBadges = badges
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, maxVisible);

  const containerClasses = cn(
    'flex',
    {
      'flex-row flex-wrap gap-2': layout === 'horizontal',
      'flex-col gap-2': layout === 'vertical',
      'grid grid-cols-2 gap-2': layout === 'grid',
    },
    className
  );

  return (
    <div className={containerClasses}>
      {sortedBadges.map((badge, index) => (
        <TrustBadge
          key={`${badge.type}-${index}`}
          showText={showText}
          size={size}
          type={badge.type}
          variant={variant}
        />
      ))}
    </div>
  );
};

// Marketplace Trust Section
export interface MarketplaceTrustSectionProps {
  title?: string;
  features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    highlighted?: boolean;
  }>;
  variant?: 'default' | 'compact';
  className?: string;
}

export const MarketplaceTrustSection: React.FC<
  MarketplaceTrustSectionProps
> = ({
  title = 'Why Shop with Confidence',
  features,
  variant = 'default',
  className,
}) => {
  const containerClasses = cn(
    'space-y-6',
    variant === 'compact' && 'space-y-4',
    className
  );

  return (
    <div className={containerClasses}>
      {title && (
        <h3
          className={cn(
            'text-center font-bold',
            variant === 'compact' ? 'text-lg' : 'text-xl'
          )}
        >
          {title}
        </h3>
      )}

      <div
        className={cn(
          'grid gap-4',
          variant === 'compact' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
        )}
      >
        {features.map((feature, index) => (
          <Card
            className={cn(
              'text-center transition-all duration-300 hover:shadow-md',
              feature.highlighted &&
                'border-[oklch(var(--brand-primary))] bg-[oklch(var(--brand-primary)/.05)]'
            )}
            key={index}
          >
            <CardContent
              className={cn(
                'space-y-2 p-4',
                variant === 'compact' && 'space-y-1 p-3'
              )}
            >
              <div className="flex justify-center text-[oklch(var(--brand-primary))]">
                {feature.icon}
              </div>
              <h4
                className={cn(
                  'font-semibold',
                  variant === 'compact' ? 'text-sm' : 'text-base'
                )}
              >
                {feature.title}
              </h4>
              <p
                className={cn(
                  'text-muted-foreground',
                  variant === 'compact' ? 'text-xs' : 'text-sm'
                )}
              >
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Common trust features for Threadly marketplace
export const threadlyTrustFeatures = [
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'Verified Sellers',
    description: 'All sellers are identity-verified for your safety',
    highlighted: true,
  },
  {
    icon: <SecurePaymentIcon size={32} />,
    title: 'Secure Payments',
    description: 'Protected transactions with Stripe encryption',
  },
  {
    icon: <RotateCcw className="h-8 w-8" />,
    title: 'Easy Returns',
    description: '30-day return policy on all purchases',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Authenticity Guarantee',
    description: 'Genuine items verified by our expert team',
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: 'Fast Shipping',
    description: 'Most items ship within 1-2 business days',
  },
  {
    icon: <Star className="h-8 w-8 fill-current" />,
    title: 'Quality Ratings',
    description: 'Detailed condition ratings for every item',
  },
] as const;
