import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

// Message list skeleton
export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="flex items-start space-x-3" key={i}>
          <Skeleton className="h-10 w-10 rounded-[var(--radius-full)]" />
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

// Conversation skeleton
export function ConversationSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b p-4">
        <Skeleton className="h-10 w-10 rounded-[var(--radius-full)]" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            className={cn(
              'flex',
              i % 3 === 0 ? 'justify-end' : 'justify-start'
            )}
            key={i}
          >
            <div
              className={cn(
                'max-w-xs space-y-2',
                i % 3 === 0 ? 'items-end' : 'items-start'
              )}
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton
                className={cn(
                  'h-10 rounded-[var(--radius-lg)]',
                  i % 3 === 0 ? 'w-32' : 'w-40'
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <Skeleton className="h-12 w-full rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}

// Chat input skeleton
export function ChatInputSkeleton() {
  return (
    <div className="flex items-center space-x-2 border-t p-4">
      <Skeleton className="h-10 w-10 rounded-[var(--radius-full)]" />
      <Skeleton className="h-10 flex-1 rounded-[var(--radius-lg)]" />
      <Skeleton className="h-10 w-10 rounded-[var(--radius-lg)]" />
    </div>
  );
}

// Message bubble skeleton
export function MessageBubbleSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xs space-y-1',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        <Skeleton className="h-3 w-16" />
        <Skeleton
          className={cn(
            'h-10 rounded-[var(--radius-lg)]',
            isOwn ? 'w-32' : 'w-40'
          )}
        />
      </div>
    </div>
  );
}
