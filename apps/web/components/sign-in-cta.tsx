'use client';

import { Button } from '@repo/ui/components';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { env } from '@/env';

interface SignInCTAProps {
  children: ReactNode;
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  redirectPath?: string;
  fullWidth?: boolean;
}

export function SignInCTA({
  children,
  variant = 'default',
  size = 'default',
  className,
  redirectPath,
  fullWidth = false,
}: SignInCTAProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'bg';

  // Stay in web app for sign-in
  const signInUrl = `/${locale}/sign-in`;

  return (
    <Button
      asChild
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
      size={size}
      variant={variant}
    >
      <Link href={signInUrl}>{children}</Link>
    </Button>
  );
}
