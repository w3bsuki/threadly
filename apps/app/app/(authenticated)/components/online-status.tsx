'use client';

import { usePresence } from '@repo/real-time/client';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Dot } from 'lucide-react';

interface OnlineStatusProps {
  userId: string;
  className?: string;
  showText?: boolean;
}

export function OnlineStatus({ userId, className, showText = false }: OnlineStatusProps) {
  const { members } = usePresence(`presence-users`);
  const isOnline = members.has(userId);

  if (!showText) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
        )}
      </div>
    );
  }

  return (
    <Badge
      variant={isOnline ? 'default' : 'secondary'}
      className={`text-xs ${className}`}
    >
      <Dot className={`w-3 h-3 mr-1 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </Badge>
  );
}