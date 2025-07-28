'use client';

interface TypingIndicatorWithAvatarProps {
  userName: string;
  userAvatar?: string;
  className?: string;
}

export function TypingIndicatorWithAvatar({
  userName,
  userAvatar,
  className,
}: TypingIndicatorWithAvatarProps) {
  return (
    <div className={`flex items-start gap-3 ${className || ''}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] bg-accent">
        {userAvatar ? (
          <img
            alt={userName}
            className="h-8 w-8 rounded-[var(--radius-full)]"
            src={userAvatar}
          />
        ) : (
          <span className="font-medium text-muted-foreground text-xs">
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="max-w-xs rounded-[var(--radius-lg)] bg-secondary p-3">
          <div className="flex space-x-1">
            <div className="h-2 w-2 animate-pulse rounded-[var(--radius-full)] bg-muted-foreground/20" />
            <div className="h-2 w-2 animate-pulse rounded-[var(--radius-full)] bg-muted-foreground/20 delay-75" />
            <div className="h-2 w-2 animate-pulse rounded-[var(--radius-full)] bg-muted-foreground/20 delay-150" />
          </div>
        </div>
      </div>
    </div>
  );
}
