'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '../../../../lib/hooks/use-media-query';
import { ProductQuickViewDesktop } from './desktop-view';
import { ProductQuickViewMobile } from './mobile-view';

interface ProductQuickViewProps {
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    originalPrice?: number | null;
    size: string;
    condition: string;
    categoryName: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      location: string;
      rating: number;
    };
    favoritesCount: number;
    createdAt: Date;
  };
  trigger?: React.ReactNode;
}

export function ProductQuickView({ product, trigger }: ProductQuickViewProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return trigger during SSR to prevent layout shift
    return <>{trigger}</>;
  }

  // Choose component based on device type
  const Component = isMobile ? ProductQuickViewMobile : ProductQuickViewDesktop;

  return (
    <Component
      onOpenChange={setOpen}
      open={open}
      product={product}
      trigger={trigger}
    />
  );
}
