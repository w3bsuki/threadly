'use client';

import { useState } from 'react';
import { 
  MobileInteractions, 
  ReachabilityZone, 
  hapticFeedback,
  useLongPress,
  useDoubleTap 
} from '@repo/design-system/components';
import { toast } from '@repo/design-system/components';

export function MobileInteractionsExample() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string>('');

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshCount(prev => prev + 1);
    toast.success('Content refreshed!');
  };

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      hapticFeedback.heavy();
      toast.info('Long press detected!');
    }
  });

  const doubleTapHandlers = useDoubleTap({
    onDoubleTap: () => {
      hapticFeedback.success();
      toast.info('Double tap detected!');
    }
  });

  return (
    <MobileInteractions
      onRefresh={handleRefresh}
      onSwipeLeft={() => {
        setSwipeDirection('left');
        toast.info('Swiped left');
      }}
      onSwipeRight={() => {
        setSwipeDirection('right');
        toast.info('Swiped right');
      }}
      enablePullToRefresh
      enableSwipeGestures
      enableHapticFeedback
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold">Mobile Interactions Demo</h1>
        
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
            className="w-full p-4 bg-primary text-primary-foreground rounded-lg"
            onClick={() => {
              hapticFeedback.medium();
              toast.info('Button clicked with haptic feedback');
            }}
          >
            Tap for Medium Haptic
          </button>

          <button
            {...longPressHandlers}
            className="w-full p-4 bg-secondary text-secondary-foreground rounded-lg"
          >
            Long Press Me
          </button>

          <ReachabilityZone
            onActivate={() => {
              hapticFeedback.success();
              toast.success('Reachability zone activated!');
            }}
            className="w-full"
          >
            <div 
              {...doubleTapHandlers}
              className="w-full p-4 bg-accent text-accent-foreground rounded-lg text-center"
            >
              Double Tap for Reachability
            </div>
          </ReachabilityZone>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => hapticFeedback.success()}
            className="p-3 bg-green-500 text-white rounded-lg"
          >
            Success Haptic
          </button>
          
          <button
            onClick={() => hapticFeedback.error()}
            className="p-3 bg-red-500 text-white rounded-lg"
          >
            Error Haptic
          </button>
        </div>

        <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">
            Swipe left/right or pull down to refresh
          </p>
        </div>
      </div>
    </MobileInteractions>
  );
}