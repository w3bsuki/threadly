'use client';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  NotificationSkeleton,
} from '@repo/ui/components';
import { useNotifications } from '@repo/notifications/realtime/client';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck } from 'lucide-react';

export function NotificationBell(): React.JSX.Element {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const isLoading = false; // TODO: Add back once real-time package types are updated

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="touch-target relative" size="sm" variant="ghost">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="-right-1 -top-1 absolute h-5 w-5 rounded-[var(--radius-full)] p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{unreadCount} unread notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
              size="sm"
              variant="ghost"
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
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                className="flex flex-col items-start gap-1 p-3"
                key={notification.id}
                onClick={() =>
                  !notification.read && handleMarkAsRead(notification.id)
                }
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-[var(--radius-full)] bg-blue-500" />
                      )}
                    </div>
                    <p className="line-clamp-2 text-muted-foreground text-xs">
                      {notification.message}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {!notification.read && (
                    <Button
                      className="ml-2 h-auto p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            {notifications.length > 10 && <DropdownMenuSeparator />}

            <DropdownMenuItem className="text-center">
              <Button className="w-full" size="sm" variant="ghost">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
