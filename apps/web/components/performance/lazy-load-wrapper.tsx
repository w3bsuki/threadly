'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

interface LazyLoadWrapperProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  onVisible?: () => void;
}

export function LazyLoadWrapper({
  children,
  threshold = 0,
  rootMargin = '50px',
  fallback = null,
  onVisible,
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin, onVisible]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}
