'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';

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
    if (!isVisible || isPaused) return;

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
    localStorage.setItem('promotionalBannerDismissed', dismissUntil.toISOString());
  };

  const goToOffer = (index: number) => {
    setCurrentOffer(index);
    setIsPaused(true);
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (!isVisible) return null;

  return (
    <div className={cn('relative bg-gray-50 border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Offer content */}
          <div className="flex-1 flex items-center justify-center space-x-3">
            {/* Navigation arrows - desktop only */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={() => goToOffer((currentOffer - 1 + offers.length) % offers.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Offer text with fade transition */}
            <div className="relative h-6 flex items-center">
              {offers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-opacity duration-500',
                    index === currentOffer ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  )}
                >
                  <span className="text-sm text-gray-700 font-medium">
                    <span className="mr-2">{offer.icon}</span>
                    {offer.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Navigation arrows - desktop only */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={() => goToOffer((currentOffer + 1) % offers.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation dots */}
          <div className="hidden md:flex items-center space-x-1.5 mr-8">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToOffer(index)}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-300',
                  index === currentOffer
                    ? 'bg-gray-600 w-3'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600 -mr-2"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}