'use client';

import { useState, useRef, useEffect } from 'react';
import { ReviewCard } from './review-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';

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

export function SwipeableReviews({ reviews, className }: SwipeableReviewsProps) {
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
    if (!touchStart || !touchEnd) return;
    
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
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  if (reviews.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        No reviews yet
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Mobile Swipeable View */}
      <div className="md:hidden">
        <div
          ref={containerRef}
          className="flex overflow-x-hidden snap-x snap-mandatory"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="w-full flex-shrink-0 snap-center px-4"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Review counter */}
        <p className="text-center text-sm text-muted-foreground mt-2">
          {currentIndex + 1} of {reviews.length} reviews
        </p>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block">
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-full justify-between px-2 pointer-events-none">
        <button
          onClick={prevReview}
          className={cn(
            "pointer-events-auto bg-background/80 backdrop-blur border rounded-full p-2 shadow-lg transition-opacity",
            currentIndex === 0 ? "opacity-0" : "opacity-100"
          )}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button
          onClick={nextReview}
          className={cn(
            "pointer-events-auto bg-background/80 backdrop-blur border rounded-full p-2 shadow-lg transition-opacity",
            currentIndex === reviews.length - 1 ? "opacity-0" : "opacity-100"
          )}
          disabled={currentIndex === reviews.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}