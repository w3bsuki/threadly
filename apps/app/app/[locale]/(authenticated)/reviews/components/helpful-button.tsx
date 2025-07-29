'use client';

import { cn } from '@repo/ui/lib/utils';
import { ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

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
  className,
}: HelpfulButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticHelpful, setOptimisticHelpful] = useState(isHelpful);
  const [optimisticCount, setOptimisticCount] = useState(helpfulCount);

  const handleVote = async () => {
    // Optimistic update
    const newIsHelpful = !optimisticHelpful;
    setOptimisticHelpful(newIsHelpful);
    setOptimisticCount((prev) => prev + (newIsHelpful ? 1 : -1));

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
      className={cn(
        'flex items-center gap-2 text-sm transition-colors',
        optimisticHelpful
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground',
        isPending && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={isPending}
      onClick={handleVote}
    >
      <ThumbsUp
        className={cn('h-4 w-4', optimisticHelpful && 'fill-current')}
      />
      <span>Helpful {optimisticCount > 0 && `(${optimisticCount})`}</span>
    </button>
  );
}
