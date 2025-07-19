'use client';

import { UserButton as ClerkUserButton } from '@repo/auth/client';
import { useEffect, useState } from 'react';

export function SafeUserButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="h-8 w-8 animate-pulse rounded-[var(--radius-full)] bg-accent" />;
  }

  return <ClerkUserButton />;
}
