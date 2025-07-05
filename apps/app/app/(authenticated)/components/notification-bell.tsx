'use client';

import { useNotifications } from '@repo/real-time/client';
import { Button } from '@repo/design-system/components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NotificationSkeleton } from '@/components/skeletons';

export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative touch-target">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount} unread notifications
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-2">
            <NotificationSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3"
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            
            {notifications.length > 10 && (
              <DropdownMenuSeparator />
            )}
            
            <DropdownMenuItem className="text-center">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}