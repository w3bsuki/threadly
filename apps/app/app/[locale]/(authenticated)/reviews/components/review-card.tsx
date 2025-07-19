'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { formatDistanceToNow } from 'date-fns';
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

  const reviewerName = [review.reviewer.firstName, review.reviewer.lastName]
    .filter(Boolean)
    .join(' ') || 'Anonymous';

  const initials = [review.reviewer.firstName?.[0], review.reviewer.lastName?.[0]]
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
    <div className={cn(
      "bg-card rounded-[var(--radius-lg)] border",
      variant === 'compact' ? 'p-3' : 'p-4'
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className={variant === 'compact' ? 'h-8 w-8' : 'h-10 w-10'}>
          <AvatarImage src={review.reviewer.imageUrl || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "font-medium",
              variant === 'compact' ? 'text-sm' : 'text-base'
            )}>
              {reviewerName}
            </h4>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(review.createdAt, { addSuffix: true })}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "transition-colors",
                  variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4',
                  i < review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                )}
              />
            ))}
            <span className={cn(
              "text-muted-foreground ml-1",
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {review.rating}.0
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className={cn(
          "text-foreground mb-3",
          variant === 'compact' ? 'text-sm line-clamp-3' : 'text-base'
        )}>
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
                  key={index}
                  className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden cursor-pointer"
                  onClick={() => {
                    setCurrentPhotoIndex(index);
                    setShowAllPhotos(false);
                  }}
                >
                  <Image
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-video rounded-[var(--radius-lg)] overflow-hidden bg-muted">
                <Image
                  src={review.photos[currentPhotoIndex]}
                  alt={`Review photo ${currentPhotoIndex + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Photo navigation */}
                {review.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className={cn(
                        "absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/50 text-background rounded-[var(--radius-full)] p-1",
                        currentPhotoIndex === 0 && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={nextPhoto}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/50 text-background rounded-[var(--radius-full)] p-1",
                        currentPhotoIndex === review.photos.length - 1 && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={currentPhotoIndex === review.photos.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    
                    {/* Photo indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {review.photos.map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-1.5 h-1.5 rounded-[var(--radius-full)] transition-colors",
                            index === currentPhotoIndex
                              ? "bg-background"
                              : "bg-background/50"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {/* View all photos button */}
                {variant === 'default' && review.photos.length > 1 && (
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="absolute top-2 right-2 bg-foreground/50 text-background rounded-[var(--radius-md)] px-2 py-1 text-xs flex items-center gap-1"
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
        <div className="flex items-center gap-4 pt-3 border-t">
          <HelpfulButton
            reviewId={review.id}
            helpfulCount={review.helpfulCount || 0}
            isHelpful={review.isHelpful}
          />
        </div>
      )}
    </div>
  );
}