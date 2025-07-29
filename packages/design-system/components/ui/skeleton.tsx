import { cn } from '@repo/ui/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200/80 via-gray-100 to-gray-200/80',
        'animate-shimmer rounded-[var(--radius-md)] bg-[length:200%_100%]',
        'relative overflow-hidden',
        className
      )}
      data-slot="skeleton"
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      }}
      {...props}
    />
  );
}

// Enhanced skeleton with shimmer effect
function SkeletonShimmer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200/60 via-gray-50 to-gray-200/60',
        'animate-shimmer rounded-[var(--radius-md)] bg-[length:200%_100%]',
        'relative overflow-hidden',
        className
      )}
      data-slot="skeleton-shimmer"
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
      }}
      {...props}
    />
  );
}

// Content-aware skeleton for text
function SkeletonText({
  lines = 1,
  className,
  lineClassName,
  ...props
}: React.ComponentProps<'div'> & {
  lines?: number;
  lineClassName?: string;
}) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
            lineClassName
          )}
          key={i}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
function SkeletonAvatar({
  size = 'md',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton
      className={cn(
        'rounded-[var(--radius-full)]',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton, SkeletonShimmer, SkeletonText, SkeletonAvatar };
