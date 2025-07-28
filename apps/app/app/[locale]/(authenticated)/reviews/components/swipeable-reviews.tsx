'use client';

import { cn } from '@repo/design-system/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ReviewCard } from './review-card';

interface SwipeableReviewsProps {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    reviewer: {
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
    photos?: string[];
    helpfulCount?: number;
    isHelpful?: boolean;
  }>;
  className?: string;
}

export function SwipeableReviews({
  reviews,
  className,
}: SwipeableReviewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!(touchStart && touchEnd)) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < reviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToReview = (index: number) => {
    setCurrentIndex(index);
  };

  const nextReview = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevReview = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: currentIndex * containerRef.current.offsetWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  if (reviews.length === 0) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        No reviews yet
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Mobile Swipeable View */}
      <div className="md:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-hidden"
          onTouchEnd={onTouchEnd}
          onTouchMove={onTouchMove}
          onTouchStart={onTouchStart}
          ref={containerRef}
        >
          {reviews.map((review, index) => (
            <div
              className="w-full flex-shrink-0 snap-center px-4"
              key={review.id}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="mt-4 flex justify-center gap-1.5">
          {reviews.map((_, index) => (
            <button
              className={cn(
                'h-2 w-2 rounded-[var(--radius-full)] transition-all',
                index === currentIndex
                  ? 'w-6 bg-primary'
                  : 'bg-muted-foreground/30'
              )}
              key={index}
              onClick={() => goToReview(index)}
            />
          ))}
        </div>

        {/* Review counter */}
        <p className="mt-2 text-center text-muted-foreground text-sm">
          {currentIndex + 1} of {reviews.length} reviews
        </p>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block">
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 hidden w-full justify-between px-2 md:flex">
        <button
          className={cn(
            'pointer-events-auto rounded-[var(--radius-full)] border bg-background/80 p-2 shadow-lg backdrop-blur transition-opacity',
            currentIndex === 0 ? 'opacity-0' : 'opacity-100'
          )}
          disabled={currentIndex === 0}
          onClick={prevReview}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          className={cn(
            'pointer-events-auto rounded-[var(--radius-full)] border bg-background/80 p-2 shadow-lg backdrop-blur transition-opacity',
            currentIndex === reviews.length - 1 ? 'opacity-0' : 'opacity-100'
          )}
          disabled={currentIndex === reviews.length - 1}
          onClick={nextReview}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
