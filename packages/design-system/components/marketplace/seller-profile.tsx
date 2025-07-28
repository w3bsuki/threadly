'use client';

import {
  Calendar,
  MapPin,
  MessageCircle,
  Package,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { ConditionStars, PremiumBadge, VerifiedBadge } from '../brand/icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';

export interface SellerProfileProps {
  seller: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    bio?: string;
    location?: string;
    isVerified?: boolean;
    isPremium?: boolean;
    joinedAt: Date;
    averageRating?: number;
    totalReviews: number;
  };
  stats: {
    totalListings: number;
    totalSales: number;
    followersCount: number;
    followingCount: number;
    responseRate?: number;
    averageShippingTime?: number;
  };
  isFollowing?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  onFollow?: (sellerId: string, isFollowing: boolean) => void;
  onMessage?: (sellerId: string) => void;
  onViewListings?: (sellerId: string) => void;
  className?: string;
}

export const SellerProfile: React.FC<SellerProfileProps> = ({
  seller,
  stats,
  isFollowing = false,
  variant = 'default',
  onFollow,
  onMessage,
  onViewListings,
  className,
}) => {
  const [following, setFollowing] = React.useState(isFollowing);
  const [isLoading, setIsLoading] = React.useState(false);

  const sellerName =
    `${seller.firstName || ''} ${seller.lastName || ''}`.trim() ||
    seller.username ||
    'Anonymous';
  const initials = sellerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const joinedYear = seller.joinedAt.getFullYear();
  const joinedMonth = seller.joinedAt.toLocaleDateString('en-US', {
    month: 'long',
  });

  const handleFollow = async () => {
    setIsLoading(true);
    const newFollowingState = !following;
    setFollowing(newFollowingState);
    await onFollow?.(seller.id, newFollowingState);
    setIsLoading(false);
  };

  const handleMessage = () => {
    onMessage?.(seller.id);
  };

  const handleViewListings = () => {
    onViewListings?.(seller.id);
  };

  const cardClasses = cn(
    'transition-all duration-300 hover:shadow-lg',
    {
      'max-w-sm': variant === 'compact',
      'max-w-2xl': variant === 'detailed',
    },
    className
  );

  if (variant === 'compact') {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage alt={sellerName} src={seller.avatarUrl} />
              <AvatarFallback className="bg-[oklch(var(--brand-primary)/.1)] text-[oklch(var(--brand-primary))]">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="truncate font-semibold text-sm">{sellerName}</h3>
                {seller.isVerified && <VerifiedBadge size={14} />}
                {seller.isPremium && <PremiumBadge size={14} />}
              </div>

              {seller.averageRating && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Star className="h-3 w-3 fill-[oklch(var(--brand-accent))] text-[oklch(var(--brand-accent))]" />
                  <span>{seller.averageRating.toFixed(1)}</span>
                  <span>({stats.totalSales} sales)</span>
                </div>
              )}
            </div>

            <Button
              disabled={isLoading}
              onClick={handleFollow}
              size="sm"
              variant={following ? 'brand-outline' : 'brand-primary'}
            >
              {isLoading ? '...' : following ? 'Following' : 'Follow'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClasses}>
      {/* Cover Image */}
      {variant === 'detailed' && (
        <div className="relative h-24 bg-gradient-to-r from-[oklch(var(--brand-primary)/.1)] to-[oklch(var(--brand-accent)/.1)]">
          {seller.coverImageUrl && (
            <Image
              alt={`${sellerName}'s cover`}
              className="object-cover"
              fill
              src={seller.coverImageUrl}
            />
          )}
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Avatar */}
          <div className="relative">
            <Avatar
              className={cn(
                'h-16 w-16',
                variant === 'detailed' &&
                  '-mt-10 h-20 w-20 border-4 border-background'
              )}
            >
              <AvatarImage alt={sellerName} src={seller.avatarUrl} />
              <AvatarFallback className="bg-[oklch(var(--brand-primary)/.1)] text-[oklch(var(--brand-primary))] text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Seller Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xl">{sellerName}</h2>
              {seller.isVerified && <VerifiedBadge size={20} />}
              {seller.isPremium && <PremiumBadge size={20} />}
            </div>

            {/* Rating */}
            {seller.averageRating && (
              <div className="flex items-center gap-2">
                <ConditionStars
                  rating={Math.round(seller.averageRating) as 1 | 2 | 3 | 4 | 5}
                  size={12}
                />
                <span className="font-medium text-sm">
                  {seller.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({seller.totalReviews} reviews)
                </span>
              </div>
            )}

            {/* Location & Join Date */}
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              {seller.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{seller.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {joinedMonth} {joinedYear}
                </span>
              </div>
            </div>

            {/* Bio */}
            {seller.bio && variant === 'detailed' && (
              <p className="mt-2 text-muted-foreground text-sm">{seller.bio}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              className="min-w-[100px]"
              disabled={isLoading}
              onClick={handleFollow}
              variant={following ? 'brand-outline' : 'brand-primary'}
            >
              <Users className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
            </Button>

            <Button onClick={handleMessage} variant="brand-secondary">
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="font-bold text-[oklch(var(--brand-primary))] text-lg">
              {stats.totalListings.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">Listings</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[oklch(var(--brand-secondary))] text-lg">
              {stats.totalSales.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">Sales</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[oklch(var(--brand-accent))] text-lg">
              {stats.followersCount.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">Followers</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-[oklch(var(--brand-purple))] text-lg">
              {stats.followingCount.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">Following</div>
          </div>
        </div>

        {/* Performance Metrics */}
        {variant === 'detailed' &&
          (stats.responseRate || stats.averageShippingTime) && (
            <div className="border-t pt-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-sm">
                <Shield className="h-4 w-4" />
                Performance
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {stats.responseRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Response Rate
                    </span>
                    <Badge
                      className="bg-[oklch(var(--success-gentle))] text-[oklch(var(--brand-secondary))]"
                      variant="secondary"
                    >
                      {stats.responseRate}%
                    </Badge>
                  </div>
                )}
                {stats.averageShippingTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Avg. Shipping
                    </span>
                    <Badge
                      className="bg-[oklch(var(--info-gentle))] text-[oklch(var(--brand-primary))]"
                      variant="secondary"
                    >
                      {stats.averageShippingTime} days
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* View Listings Button */}
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={handleViewListings}
            variant="brand-outline"
          >
            <Package className="mr-2 h-4 w-4" />
            View All Listings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
