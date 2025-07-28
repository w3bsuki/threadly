'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Camera, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { HelpfulButton } from './helpful-button';

interface ReviewCardProps {
  review: {
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
  };
  variant?: 'default' | 'compact';
}

export function ReviewCard({ review, variant = 'default' }: ReviewCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const reviewerName =
    [review.reviewer.firstName, review.reviewer.lastName]
      .filter(Boolean)
      .join(' ') || 'Anonymous';

  const initials =
    [review.reviewer.firstName?.[0], review.reviewer.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'A';

  const nextPhoto = () => {
    if (review.photos && currentPhotoIndex < review.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border bg-card',
        variant === 'compact' ? 'p-3' : 'p-4'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <Avatar className={variant === 'compact' ? 'h-8 w-8' : 'h-10 w-10'}>
          <AvatarImage src={review.reviewer.imageUrl || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4
              className={cn(
                'font-medium',
                variant === 'compact' ? 'text-sm' : 'text-base'
              )}
            >
              {reviewerName}
            </h4>
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(review.createdAt, { addSuffix: true })}
            </span>
          </div>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                className={cn(
                  'transition-colors',
                  variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4',
                  i < review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                )}
                key={i}
              />
            ))}
            <span
              className={cn(
                'ml-1 text-muted-foreground',
                variant === 'compact' ? 'text-xs' : 'text-sm'
              )}
            >
              {review.rating}.0
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p
          className={cn(
            'mb-3 text-foreground',
            variant === 'compact' ? 'line-clamp-3 text-sm' : 'text-base'
          )}
        >
          {review.comment}
        </p>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-3">
          {variant === 'default' && showAllPhotos ? (
            <div className="grid grid-cols-3 gap-2">
              {review.photos.map((photo, index) => (
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius-lg)]"
                  key={index}
                  onClick={() => {
                    setCurrentPhotoIndex(index);
                    setShowAllPhotos(false);
                  }}
                >
                  <Image
                    alt={`Review photo ${index + 1}`}
                    className="object-cover"
                    fill
                    src={photo}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-muted">
                <Image
                  alt={`Review photo ${currentPhotoIndex + 1}`}
                  className="object-cover"
                  fill
                  src={review.photos[currentPhotoIndex]}
                />

                {/* Photo navigation */}
                {review.photos.length > 1 && (
                  <>
                    <button
                      className={cn(
                        '-translate-y-1/2 absolute top-1/2 left-2 rounded-[var(--radius-full)] bg-foreground/50 p-1 text-background',
                        currentPhotoIndex === 0 &&
                          'cursor-not-allowed opacity-50'
                      )}
                      disabled={currentPhotoIndex === 0}
                      onClick={prevPhoto}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      className={cn(
                        '-translate-y-1/2 absolute top-1/2 right-2 rounded-[var(--radius-full)] bg-foreground/50 p-1 text-background',
                        currentPhotoIndex === review.photos.length - 1 &&
                          'cursor-not-allowed opacity-50'
                      )}
                      disabled={currentPhotoIndex === review.photos.length - 1}
                      onClick={nextPhoto}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Photo indicators */}
                    <div className="-translate-x-1/2 absolute bottom-2 left-1/2 flex gap-1">
                      {review.photos.map((_, index) => (
                        <div
                          className={cn(
                            'h-1.5 w-1.5 rounded-[var(--radius-full)] transition-colors',
                            index === currentPhotoIndex
                              ? 'bg-background'
                              : 'bg-background/50'
                          )}
                          key={index}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* View all photos button */}
                {variant === 'default' && review.photos.length > 1 && (
                  <button
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-[var(--radius-md)] bg-foreground/50 px-2 py-1 text-background text-xs"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <Camera className="h-3 w-3" />
                    {review.photos.length}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {variant === 'default' && (
        <div className="flex items-center gap-4 border-t pt-3">
          <HelpfulButton
            helpfulCount={review.helpfulCount || 0}
            isHelpful={review.isHelpful}
            reviewId={review.id}
          />
        </div>
      )}
    </div>
  );
}
