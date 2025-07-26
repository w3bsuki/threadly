'use client';

import { SignInButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { motion, useAnimation, useDragControls, useMotionValue } from 'framer-motion';
import { Heart, Plus, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { memo, useCallback, useEffect, useState } from 'react';
import { env } from '@/env';
import { useI18n } from '../providers/i18n-provider';
import { MobileCategoriesNav } from './mobile-categories-nav';
import { SafeUserButton } from './safe-user-button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = memo(({ isOpen, onClose }: MobileMenuProps) => {
  const { isSignedIn, user } = useUser();
  const { locale } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const x = useMotionValue(0);

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      controls.start({ x: 0 });
    } else {
      controls.start({ x: '-100%' });
    }
  }, [isOpen, controls]);

  // Edge swipe detection
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isSwipeDetected = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isSwipeDetected = startX < 20; // Edge threshold
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeDetected || isOpen) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);
      
      // Horizontal swipe detection
      if (deltaX > 50 && deltaY < 30) {
        triggerHapticFeedback();
        onClose();
        isSwipeDetected = false;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen, onClose, triggerHapticFeedback]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        aria-hidden="true"
        className="fade-in-0 absolute inset-0 animate-in bg-foreground/80 duration-200"
        onClick={onClose}
      />

      <motion.div
        aria-label="Navigation menu"
        aria-modal="true"
        animate={controls}
        className="relative flex h-full flex-col bg-background"
        drag="x"
        dragConstraints={{ left: -300, right: 0 }}
        dragControls={dragControls}
        dragElastic={0.2}
        id="mobile-menu"
        initial={{ x: '-100%' }}
        onDragEnd={(event, info) => {
          if (info.offset.x < -100) {
            onClose();
          }
        }}
        role="dialog"
        style={{ x }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between border-b p-4">
          <Link href="/" onClick={() => {
            triggerHapticFeedback();
            onClose();
          }}>
            <span className="font-bold text-xl">Threadly</span>
          </Link>
          <Button
            aria-label="Close navigation menu"
            className="h-12 w-12"
            onClick={() => {
              triggerHapticFeedback();
              onClose();
            }}
            size="icon"
            variant="ghost"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b p-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <SafeUserButton />
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-muted-foreground text-sm">View your profile</p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button className="h-14 w-full text-base" variant="outline">
                  <User className="mr-3 h-5 w-5" />
                  Sign In / Join
                </Button>
              </SignInButton>
            )}
          </div>

          <MobileCategoriesNav
            expandedCategories={expandedCategories}
            onClose={onClose}
            onToggleCategory={toggleCategoryExpansion}
          />

          <div className="space-y-3 p-4">
            <Link
              className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-pink-50 p-4 transition-all hover:bg-pink-100 active:scale-95"
              href="/favorites"
              onClick={() => {
                triggerHapticFeedback();
                onClose();
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-pink-100">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Saved Items</p>
                <p className="text-muted-foreground text-sm">
                  Your wishlist & favorites
                </p>
              </div>
            </Link>

            <Link
              className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-blue-50 p-4 transition-all hover:bg-blue-100 active:scale-95"
              href="/products"
              onClick={() => {
                triggerHapticFeedback();
                onClose();
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Browse All</p>
                <p className="text-muted-foreground text-sm">Explore everything</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="border-t bg-muted p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {isSignedIn ? (
            <Button
              asChild
              className="h-14 w-full bg-foreground font-medium text-base text-background hover:bg-secondary-foreground"
            >
              <Link
                href={`/${locale}/selling/new`}
                onClick={() => {
                  triggerHapticFeedback();
                  onClose();
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Selling
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-14 w-full bg-foreground font-medium text-base text-background hover:bg-secondary-foreground"
            >
              <Link
                href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in?returnTo=${encodeURIComponent(`${env.NEXT_PUBLIC_WEB_URL}/${locale}/selling/new`)}`}
                onClick={() => {
                  triggerHapticFeedback();
                  onClose();
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Selling
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

MobileMenu.displayName = 'MobileMenu';