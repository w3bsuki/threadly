'use client';

import { Button } from '@repo/design-system/components';
import { env } from '@/env';
import Link from 'next/link';
import { ReactNode } from 'react';

interface SignInCTAProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
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
  fullWidth = false
}: SignInCTAProps) {
  // Determine app URL based on environment
  let appUrl = env.NEXT_PUBLIC_APP_URL;
  
  // Production fallback: try to construct app URL from current web URL
  if (!appUrl && typeof window !== 'undefined') {
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    
    // Handle different deployment patterns
    if (currentHost.includes('vercel.app')) {
      // Vercel deployment: replace threadly-web with threadly-app
      appUrl = `${protocol}//${currentHost.replace('threadly-web', 'threadly-app')}`;
    } else if (currentHost.includes('localhost:3001')) {
      // Local development
      appUrl = `${protocol}//${currentHost.replace(':3001', ':3000')}`;
    } else {
      // Default production assumption
      appUrl = `${protocol}//${currentHost.replace('web.', 'app.')}`;
    }
  }
  
  // Final fallback
  if (!appUrl) {
    appUrl = 'http://localhost:3000';
  }
  
  const signInUrl = redirectPath 
    ? `${appUrl}/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`
    : `${appUrl}/sign-in`;


  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
      asChild
    >
      <Link href={signInUrl}>
        {children}
      </Link>
    </Button>
  );
}