'use client';

import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const offers = [
  {
    id: 1,
    text: 'Free shipping on orders over $50',
    icon: '📦',
  },
  {
    id: 2,
    text: 'New arrivals daily from verified sellers',
    icon: '✨',
  },
  {
    id: 3,
    text: 'Secure payments & buyer protection',
    icon: '🔒',
  },
  {
    id: 4,
    text: 'Join 10,000+ fashion lovers',
    icon: '💕',
  },
];

interface PromotionalBannerProps {
  className?: string;
}

export function PromotionalBanner({ className }: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
    <div className={cn('relative bg-gray-50', className)}>
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Offer content */}
          <div className="flex flex-1 items-center justify-center space-x-3">
            {/* Navigation arrows - desktop only */}
            <Button
              className="hidden h-8 w-8 text-gray-400 hover:text-gray-600 md:flex"
              onClick={() =>
                goToOffer((currentOffer - 1 + offers.length) % offers.length)
              }
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Offer text with fade transition */}
            <div className="relative flex h-6 items-center">
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
                  <span className="font-medium text-gray-700 text-sm">
                    <span className="mr-2">{offer.icon}</span>
                    {offer.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Navigation arrows - desktop only */}
            <Button
              className="hidden h-8 w-8 text-gray-400 hover:text-gray-600 md:flex"
              onClick={() => goToOffer((currentOffer + 1) % offers.length)}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation dots */}
          <div className="mr-8 hidden items-center space-x-1.5 md:flex">
            {offers.map((_, index) => (
              <button
                aria-label={`Go to offer ${index + 1}`}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-300',
                  index === currentOffer
                    ? 'w-3 bg-gray-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                key={index}
                onClick={() => goToOffer(index)}
              />
            ))}
          </div>

          {/* Close button */}
          <Button
            className="-mr-2 h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
