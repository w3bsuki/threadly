import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

// Loading spinner component for inline loading states
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-[var(--radius-full)] border-2 border-border border-t-black',
        sizeClasses[size]
      )}
    />
  );
}

// Button loading state
export function LoadingButton({
  children,
  loading,
  loadingText = 'Loading...',
  ...props
}: {
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
  [key: string]: any;
}) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Page loading overlay
export function PageLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="space-y-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Generic list skeleton
export function ListSkeleton({
  items = 5,
  showAvatar = false,
  showImage = false,
}: {
  items?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div
          className="flex items-start space-x-3 rounded-[var(--radius-lg)] border border-border p-4"
          key={i}
        >
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-[var(--radius-full)]" />
          )}
          {showImage && (
            <Skeleton className="h-16 w-16 rounded-[var(--radius-lg)]" />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton className="h-4 w-20" key={i} />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div className="p-4" key={i}>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {Array.from({ length: cols }).map((_, j) => (
                <div className="flex items-center gap-2" key={j}>
                  {j === 0 && (
                    <Skeleton className="h-8 w-8 rounded-[var(--radius-full)]" />
                  )}
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex items-start space-x-6">
        <Skeleton className="h-24 w-24 rounded-[var(--radius-full)]" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="space-y-1 text-center" key={i}>
            <Skeleton className="mx-auto h-8 w-16" />
            <Skeleton className="mx-auto h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            className="space-y-3 rounded-[var(--radius-lg)] border border-border p-6"
            key={i}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <ListSkeleton items={5} showAvatar />
      </div>
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          className="flex items-start gap-3 rounded-[var(--radius-lg)] border p-3"
          key={i}
        >
          <Skeleton className="h-8 w-8 rounded-[var(--radius-full)]" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
