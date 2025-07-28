'use client';

import {
  hapticFeedback,
  MobileInteractions,
  ReachabilityZone,
  toast,
  useDoubleTap,
  useLongPress,
} from '@repo/design-system/components';
import { useState } from 'react';

export function MobileInteractionsExample() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string>('');

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshCount((prev) => prev + 1);
    toast.success('Content refreshed!');
  };

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      hapticFeedback.heavy();
      toast.info('Long press detected!');
    },
  });

  const doubleTapHandlers = useDoubleTap({
    onDoubleTap: () => {
      hapticFeedback.success();
      toast.info('Double tap detected!');
    },
  });

  return (
    <MobileInteractions
      className="min-h-screen bg-background"
      enableHapticFeedback
      enablePullToRefresh
      enableSwipeGestures
      onRefresh={handleRefresh}
      onSwipeLeft={() => {
        setSwipeDirection('left');
        toast.info('Swiped left');
      }}
      onSwipeRight={() => {
        setSwipeDirection('right');
        toast.info('Swiped right');
      }}
    >
      <div className="container mx-auto space-y-8 p-4">
        <h1 className="font-bold text-2xl">Mobile Interactions Demo</h1>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Pull down to refresh (Refresh count: {refreshCount})
          </p>

          <p className="text-muted-foreground">
            Last swipe direction: {swipeDirection || 'None'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            className="w-full rounded-lg bg-primary p-4 text-primary-foreground"
            onClick={() => {
              hapticFeedback.medium();
              toast.info('Button clicked with haptic feedback');
            }}
          >
            Tap for Medium Haptic
          </button>

          <button
            {...longPressHandlers}
            className="w-full rounded-lg bg-secondary p-4 text-secondary-foreground"
          >
            Long Press Me
          </button>

          <ReachabilityZone
            className="w-full"
            onActivate={() => {
              hapticFeedback.success();
              toast.success('Reachability zone activated!');
            }}
          >
            <div
              {...doubleTapHandlers}
              className="w-full rounded-lg bg-accent p-4 text-center text-accent-foreground"
            >
              Double Tap for Reachability
            </div>
          </ReachabilityZone>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            className="rounded-lg bg-green-500 p-3 text-white"
            onClick={() => hapticFeedback.success()}
          >
            Success Haptic
          </button>

          <button
            className="rounded-lg bg-red-500 p-3 text-white"
            onClick={() => hapticFeedback.error()}
          >
            Error Haptic
          </button>
        </div>

        <div className="flex h-96 items-center justify-center rounded-lg bg-muted">
          <p className="text-muted-foreground">
            Swipe left/right or pull down to refresh
          </p>
        </div>
      </div>
    </MobileInteractions>
  );
}
