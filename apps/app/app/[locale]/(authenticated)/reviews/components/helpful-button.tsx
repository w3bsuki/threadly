'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
import { useRouter } from 'next/navigation';

interface HelpfulButtonProps {
  reviewId: string;
  helpfulCount: number;
  isHelpful?: boolean;
  className?: string;
}

export function HelpfulButton({ 
  reviewId, 
  helpfulCount, 
  isHelpful = false,
  className 
}: HelpfulButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticHelpful, setOptimisticHelpful] = useState(isHelpful);
  const [optimisticCount, setOptimisticCount] = useState(helpfulCount);

  const handleVote = async () => {
    // Optimistic update
    const newIsHelpful = !optimisticHelpful;
    setOptimisticHelpful(newIsHelpful);
    setOptimisticCount(prev => prev + (newIsHelpful ? 1 : -1));

    startTransition(async () => {
      try {
        const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isHelpful: true }),
        });

        if (!response.ok) {
          // Revert on error
          setOptimisticHelpful(isHelpful);
          setOptimisticCount(helpfulCount);
        }

        router.refresh();
      } catch (error) {
        // Revert on error
        setOptimisticHelpful(isHelpful);
        setOptimisticCount(helpfulCount);
      }
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 text-sm transition-colors",
        optimisticHelpful
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <ThumbsUp className={cn(
        "h-4 w-4",
        optimisticHelpful && "fill-current"
      )} />
      <span>
        Helpful {optimisticCount > 0 && `(${optimisticCount})`}
      </span>
    </button>
  );
}