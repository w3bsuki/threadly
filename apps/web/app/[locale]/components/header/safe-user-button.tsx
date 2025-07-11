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
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  return <ClerkUserButton />;
}