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
      text: dictionary.web?.global?.promotionalBanner?.freeShipping || 'Free shipping on orders over $50',
      icon: '📦',
    },
    {
      id: 2,
      text: dictionary.web?.global?.promotionalBanner?.newArrivals || 'New arrivals daily from verified sellers',
      icon: '✨',
    },
    {
      id: 3,
      text: dictionary.web?.global?.promotionalBanner?.securePayments || 'Secure payments & buyer protection',
      icon: '🔒',
    },
    {
      id: 4,
      text: dictionary.web?.global?.promotionalBanner?.joinCommunity || 'Join 10,000+ fashion lovers',
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
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10_000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn('relative bg-primary text-primary-foreground', className)}>
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Offer content */}
          <div className="flex flex-1 items-center justify-center space-x-3">

            {/* Offer text with fade transition */}
            <div className="relative flex items-center justify-center w-full">
              {offers.map((offer, index) => (
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-opacity duration-500',
                    index === currentOffer
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  )}
                  key={offer.id}
                >
                  <span className="flex items-center text-xs sm:text-sm md:text-base font-medium">
                    <span className="mr-1.5 sm:mr-2 text-base sm:text-lg">{offer.icon}</span>
                    <span className="truncate">{offer.text}</span>
                  </span>
                </div>
              ))}
            </div>

          </div>


          {/* Close button */}
          <Button
            className="ml-2 h-6 w-6 hover:opacity-80"
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
