'use client';

import { Badge } from '@repo/ui/components';
import { usePresence } from '@repo/features/notifications/src/realtime/client';
import { Dot } from 'lucide-react';

interface OnlineStatusProps {
  userId: string;
  className?: string;
  showText?: boolean;
}

export function OnlineStatus({
  userId,
  className,
  showText = false,
}: OnlineStatusProps): React.JSX.Element {
  const { members } = usePresence('presence-users');
  const isOnline = members.has(userId);

  if (!showText) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`h-2 w-2 rounded-[var(--radius-full)] ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 h-2 w-2 animate-ping rounded-[var(--radius-full)] bg-green-500" />
        )}
      </div>
    );
  }

  return (
    <Badge
      className={`text-xs ${className}`}
      variant={isOnline ? 'default' : 'secondary'}
    >
      <Dot
        className={`mr-1 h-3 w-3 ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}
      />
      {isOnline ? 'Online' : 'Offline'}
    </Badge>
  );
}
