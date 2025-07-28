import type { LucideProps } from 'lucide-react';
import type * as React from 'react';

interface IconProps extends LucideProps {
  size?: number;
  className?: string;
}

// Threadly Logo Icon
export const ThreadlyLogo: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z"
      fill="oklch(var(--brand-primary))"
      stroke="oklch(var(--brand-primary))"
      strokeWidth="1"
    />
    <path
      d="M8 10H16M8 12H16M10 14H14"
      stroke="white"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

// Premium Seller Badge
export const PremiumBadge: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <circle cx="12" cy="12" fill="oklch(var(--premium-gold))" r="10" />
    <path
      d="M9 12L11 14L15 10"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <circle
      cx="12"
      cy="12"
      fill="none"
      opacity="0.3"
      r="6"
      stroke="white"
      strokeWidth="1"
    />
  </svg>
);

// Verified Seller Badge
export const VerifiedBadge: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
      fill="oklch(var(--verified-badge))"
      stroke="oklch(var(--verified-badge))"
      strokeWidth="1"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

// Fashion Hanger Icon
export const FashionHanger: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M12 3C10.5 3 9.5 4 9.5 5.5C9.5 6.5 10 7 11 7.5L12 8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M12 8L5 12L3 11V13L5 14L12 10L19 14L21 13V11L19 12L12 8Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M5 14V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

// Designer Tag Icon
export const DesignerTag: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M20.59 13.41L13.42 20.58C13.05 20.95 12.55 21.16 12.02 21.16C11.49 21.16 10.99 20.95 10.62 20.58L2.39 12.35C2.02 11.98 1.81 11.48 1.81 10.95V4.8C1.81 3.81 2.61 3 3.6 3H9.76C10.29 3 10.79 3.21 11.16 3.58L20.59 13.01C21.37 13.79 21.37 14.63 20.59 13.41Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <circle cx="6.5" cy="6.5" fill="currentColor" r="1.5" />
    <path
      d="M8 8L12 12"
      stroke="oklch(var(--brand-accent))"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

// Condition Rating Stars
export const ConditionStars: React.FC<
  IconProps & { rating: 1 | 2 | 3 | 4 | 5 }
> = ({ size = 24, className, rating, ...props }) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 120 24"
    width={size * 2.5}
    {...props}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <path
        d={`M${(star - 1) * 24 + 12} 2L${(star - 1) * 24 + 15.09} 8.26L${(star - 1) * 24 + 22} 9L${(star - 1) * 24 + 17} 14L${(star - 1) * 24 + 18.18} 21L${(star - 1) * 24 + 12} 17.77L${(star - 1) * 24 + 5.82} 21L${(star - 1) * 24 + 7} 14L${(star - 1) * 24 + 2} 9L${(star - 1) * 24 + 8.91} 8.26L${(star - 1) * 24 + 12} 2Z`}
        fill={
          star <= rating ? 'oklch(var(--brand-accent))' : 'oklch(var(--muted))'
        }
        key={star}
        stroke={
          star <= rating ? 'oklch(var(--brand-accent))' : 'oklch(var(--muted))'
        }
        strokeWidth="1"
      />
    ))}
  </svg>
);

// Fashion Categories Icons
export const DressIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M7 6C7 4.9 7.9 4 9 4H15C16.1 4 17 4.9 17 6V8H20L18 10V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V10L4 8H7V6Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M10 4V2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M14 4V2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

export const ShirtIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M8 4V2C8 1.45 8.45 1 9 1H15C15.55 1 16 1.45 16 2V4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M6 7L8 4H16L18 7V9L20 11V22C20 22.55 19.55 23 19 23H5C4.45 23 4 22.55 4 22V11L6 9V7Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const ShoesIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M2 18H22L20 15H18L16 12H8L6 15H4L2 18Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M8 12V8C8 6.9 8.9 6 10 6H14L16 8V12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M2 18V20H22V18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

export const AccessoriesIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 3V5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M21 12H19"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M12 19V21"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M5 12H3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

// Marketplace Action Icons
export const HeartAnimation: React.FC<IconProps & { isLiked?: boolean }> = ({
  size = 24,
  className,
  isLiked = false,
  ...props
}) => (
  <svg
    className={`${className} ${isLiked ? 'animate-bounce-in' : ''}`}
    fill={isLiked ? 'oklch(var(--brand-accent))' : 'none'}
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M20.84 4.61C20.3 4.07 19.65 3.64 18.93 3.34C18.21 3.04 17.44 2.88 16.66 2.88C15.88 2.88 15.11 3.04 14.39 3.34C13.67 3.64 13.02 4.07 12.48 4.61L12 5.09L11.52 4.61C10.43 3.52 8.97 2.88 7.34 2.88C5.71 2.88 4.25 3.52 3.16 4.61C2.07 5.7 1.43 7.16 1.43 8.79C1.43 10.42 2.07 11.88 3.16 12.97L12 21.81L20.84 12.97C21.93 11.88 22.57 10.42 22.57 8.79C22.57 7.16 21.93 5.7 20.84 4.61Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const QuickViewIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 8L16 16M16 8L8 16"
      opacity="0.3"
      stroke="oklch(var(--brand-primary))"
      strokeLinecap="round"
      strokeWidth="1"
    />
  </svg>
);

export const SecurePaymentIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <rect
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      x="3"
      y="8"
    />
    <path
      d="M7 8V6C7 3.79 8.79 2 11 2H13C15.21 2 17 3.79 17 6V8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="14" fill="oklch(var(--brand-secondary))" r="2" />
    <path
      d="M12 16V18"
      stroke="oklch(var(--brand-secondary))"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

// Export all icons grouped by category
export const ThreadlyIcons = {
  brand: {
    ThreadlyLogo,
    PremiumBadge,
    VerifiedBadge,
  },
  categories: {
    FashionHanger,
    DesignerTag,
    DressIcon,
    ShirtIcon,
    ShoesIcon,
    AccessoriesIcon,
  },
  marketplace: {
    HeartAnimation,
    QuickViewIcon,
    SecurePaymentIcon,
    ConditionStars,
  },
} as const;

// Icon showcase component for documentation
export const BrandIconShowcase: React.FC = () => (
  <div className="space-y-8 bg-background p-6">
    <div className="space-y-2 text-center">
      <h2 className="font-bold text-2xl text-foreground">
        Threadly Brand Icons
      </h2>
      <p className="text-muted-foreground">
        Custom icons for the Threadly marketplace
      </p>
    </div>

    {/* Brand Icons */}
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground text-lg">Brand Icons</h3>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <ThreadlyLogo size={48} />
          <span className="text-muted-foreground text-sm">Threadly Logo</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PremiumBadge size={48} />
          <span className="text-muted-foreground text-sm">Premium Badge</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <VerifiedBadge size={48} />
          <span className="text-muted-foreground text-sm">Verified Badge</span>
        </div>
      </div>
    </div>

    {/* Category Icons */}
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground text-lg">
        Fashion Categories
      </h3>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <DressIcon className="text-[oklch(var(--brand-primary))]" size={48} />
          <span className="text-muted-foreground text-sm">Dresses</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShirtIcon
            className="text-[oklch(var(--brand-secondary))]"
            size={48}
          />
          <span className="text-muted-foreground text-sm">Tops</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShoesIcon className="text-[oklch(var(--brand-accent))]" size={48} />
          <span className="text-muted-foreground text-sm">Shoes</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <AccessoriesIcon
            className="text-[oklch(var(--brand-purple))]"
            size={48}
          />
          <span className="text-muted-foreground text-sm">Accessories</span>
        </div>
      </div>
    </div>

    {/* Marketplace Action Icons */}
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground text-lg">
        Marketplace Actions
      </h3>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <HeartAnimation isLiked={true} size={48} />
          <span className="text-muted-foreground text-sm">
            Favorite (Liked)
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartAnimation isLiked={false} size={48} />
          <span className="text-muted-foreground text-sm">
            Favorite (Unliked)
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <QuickViewIcon
            className="text-[oklch(var(--brand-primary))]"
            size={48}
          />
          <span className="text-muted-foreground text-sm">Quick View</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <SecurePaymentIcon
            className="text-[oklch(var(--brand-secondary))]"
            size={48}
          />
          <span className="text-muted-foreground text-sm">Secure Payment</span>
        </div>
      </div>
    </div>

    {/* Condition Rating */}
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground text-lg">
        Condition Ratings
      </h3>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div className="flex items-center gap-4" key={rating}>
            <ConditionStars rating={rating as 1 | 2 | 3 | 4 | 5} size={16} />
            <span className="text-muted-foreground text-sm">
              {rating === 5 && 'New with tags'}
              {rating === 4 && 'New without tags'}
              {rating === 3 && 'Very good'}
              {rating === 2 && 'Good'}
              {rating === 1 && 'Satisfactory'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
