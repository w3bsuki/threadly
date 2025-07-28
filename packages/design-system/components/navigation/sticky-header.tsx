'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
  hideOnScroll?: boolean;
  threshold?: number;
}

export function StickyHeader({
  children,
  className,
  hideOnScroll = true,
  threshold = 50,
}: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < threshold) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    const throttledHandleScroll = () => {
      let ticking = false;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY, hideOnScroll, threshold]);

  return (
    <div
      className={cn(
        'sticky top-0 z-50',
        'transform transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className
      )}
    >
      {children}
    </div>
  );
}
