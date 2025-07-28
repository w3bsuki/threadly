'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from '../../components/providers/i18n-provider';

interface PromotionalBannerProps {
  className?: string;
}

export function PromotionalBanner({ className }: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { dictionary } = useI18n();

  const offers = [
    {
      id: 1,
      text:
        dictionary.web?.global?.promotionalBanner?.freeShipping ||
        'Free shipping on orders over $50',
      icon: '📦',
    },
    {
      id: 2,
      text:
        dictionary.web?.global?.promotionalBanner?.newArrivals ||
        'New arrivals daily from verified sellers',
      icon: '✨',
    },
    {
      id: 3,
      text:
        dictionary.web?.global?.promotionalBanner?.securePayments ||
        'Secure payments & buyer protection',
      icon: '🔒',
    },
    {
      id: 4,
      text:
        dictionary.web?.global?.promotionalBanner?.joinCommunity ||
        'Join 10,000+ fashion lovers',
      icon: '💕',
    },
  ];

  // Check if banner was dismissed
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('promotionalBannerDismissed');
    if (!dismissedUntil || new Date(dismissedUntil) < new Date()) {
      setIsVisible(true);
    }
  }, []);

  // Auto-rotate offers
  useEffect(() => {
    if (!isVisible || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, isPaused]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    // Dismiss for 7 days
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7);
    localStorage.setItem(
      'promotionalBannerDismissed',
      dismissUntil.toISOString()
    );
  };

  const goToOffer = (index: number) => {
    setCurrentOffer(index);
    setIsPaused(true);
    // Add haptic feedback for mobile interactions
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10_000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative bg-primary text-primary-foreground',
        'transform transition-all duration-300 ease-out',
        'slide-in-from-top-1 animate-in',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      {/* Add safe area support for notched devices */}
      <div className="mx-auto max-w-7xl px-4 py-3 pr-safe pl-safe sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Offer content */}
          <div className="flex min-h-[44px] flex-1 items-center justify-center">
            {/* Offer text with fade transition and mobile optimization */}
            <div className="relative flex w-full items-center justify-center px-2 sm:px-4">
              {offers.map((offer, index) => (
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out will-change-auto',
                    index === currentOffer
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  )}
                  key={offer.id}
                >
                  <span className="flex items-center font-medium text-sm sm:text-base md:text-lg">
                    <span
                      aria-hidden="true"
                      className="mr-2 text-lg sm:mr-3 sm:text-xl"
                      role="img"
                    >
                      {offer.icon}
                    </span>
                    <span className="truncate leading-relaxed">
                      {offer.text}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Close button with mobile-optimized touch target */}
          <Button
            aria-label="Dismiss promotional banner"
            className="ml-3 min-h-[44px] min-w-[44px] p-2 transition-opacity duration-200 hover:opacity-80"
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
