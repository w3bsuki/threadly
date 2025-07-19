'use client';

import Link from 'next/link';
import { cn } from '../../lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface HeaderLogoProps extends HTMLAttributes<HTMLDivElement> {
  href?: string;
  logoText?: string;
  showFullText?: boolean;
}

export const HeaderLogo = forwardRef<HTMLDivElement, HeaderLogoProps>(
  ({ className, href = '/', logoText = 'Threadly', showFullText = true, ...props }, ref) => {
    const logoContent = (
      <>
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-primary/80 shadow-md border border-primary/20 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
          <span className="font-bold text-[var(--font-size-lg)] text-primary-foreground">
            {logoText.charAt(0)}
          </span>
        </div>
        {showFullText && (
          <span className="font-bold text-[var(--font-size-xl)] text-foreground transition-colors duration-200 group-hover:text-primary">
            {logoText}
          </span>
        )}
      </>
    );

    return (
      <div ref={ref} className={cn('flex items-center', className)} {...props}>
        {href ? (
          <Link href={href} className="group flex items-center gap-[var(--space-3)]">
            {logoContent}
          </Link>
        ) : (
          <div className="group flex items-center gap-[var(--space-3)]">
            {logoContent}
          </div>
        )}
      </div>
    );
  }
);

HeaderLogo.displayName = 'HeaderLogo';