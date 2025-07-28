'use client';

import Link from 'next/link';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface HeaderLogoProps extends HTMLAttributes<HTMLDivElement> {
  href?: string;
  logoText?: string;
  showFullText?: boolean;
}

export const HeaderLogo = forwardRef<HTMLDivElement, HeaderLogoProps>(
  (
    {
      className,
      href = '/',
      logoText = 'Threadly',
      showFullText = true,
      ...props
    },
    ref
  ) => {
    const logoContent = (
      <>
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xl)] border border-primary/20 bg-gradient-to-br from-primary to-primary/80 shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
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
      <div className={cn('flex items-center', className)} ref={ref} {...props}>
        {href ? (
          <Link
            className="group flex items-center gap-[var(--space-3)]"
            href={href}
          >
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
