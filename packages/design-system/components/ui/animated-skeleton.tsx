'use client';

import { cn } from '@repo/ui/lib/utils';
import { Skeleton } from './skeleton';

interface AnimatedSkeletonProps {
  className?: string;
  count?: number;
  height?: string | number;
  width?: string | number;
  circle?: boolean;
  animation?: 'pulse' | 'shimmer' | 'wave';
}

export function AnimatedSkeleton({
  className,
  count = 1,
  height,
  width,
  circle = false,
  animation = 'shimmer',
}: AnimatedSkeletonProps) {
  const animationClass = {
    pulse: 'animate-pulse',
    shimmer:
      'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%]',
    wave: 'animate-pulse',
  }[animation];

  const elements = Array.from({ length: count }, (_, i) => (
    <Skeleton
      className={cn(
        animationClass,
        circle && 'rounded-[var(--radius-full)]',
        className
      )}
      key={i}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        animationDelay: animation === 'wave' ? `${i * 100}ms` : undefined,
      }}
    />
  ));

  return count === 1 ? elements[0] : <>{elements}</>;
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <AnimatedSkeleton className="rounded-[var(--radius-lg)]" height={300} />
      <div className="space-y-2">
        <AnimatedSkeleton height={20} width="80%" />
        <AnimatedSkeleton height={16} width="60%" />
        <div className="flex items-center gap-2">
          <AnimatedSkeleton circle height={24} width={24} />
          <AnimatedSkeleton height={16} width="40%" />
        </div>
      </div>
    </div>
  );
}

// User profile skeleton
export function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <AnimatedSkeleton circle height={48} width={48} />
      <div className="space-y-2">
        <AnimatedSkeleton height={20} width={120} />
        <AnimatedSkeleton height={16} width={80} />
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }, (_, i) => (
        <td className="p-4" key={i}>
          <AnimatedSkeleton height={16} width="80%" />
        </td>
      ))}
    </tr>
  );
}

// Text block skeleton
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <AnimatedSkeleton
          height={16}
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}
