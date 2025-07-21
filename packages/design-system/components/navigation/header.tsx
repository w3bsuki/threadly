'use client';

import { ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';
import { HeaderBase } from './header-base';
import { HeaderLogo } from './header-logo';
import { HeaderSearch } from './header-search';
import { HeaderActions } from './header-actions';
import { MobileMenu } from './mobile-menu';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

interface HeaderProps {
  logo?: {
    text?: string;
    href?: string;
  };
  search?: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch?: (query: string) => void;
  };
  actions?: ReactNode;
  mobileMenuContent?: ReactNode;
  mobileMenu?: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function Header({
  logo = { text: 'Threadly', href: '/' },
  search,
  actions,
  mobileMenuContent,
  mobileMenu,
  className,
  sticky = true,
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState(search?.value || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    search?.onChange?.(e);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search?.onSearch?.(searchValue);
  };

  return (
    <HeaderBase sticky={sticky} className={className}>
      {/* Mobile Layout - Simplified */}
      <div className="flex w-full items-center justify-between md:hidden">
        {/* Logo left */}
        <HeaderLogo
          href={logo.href}
          logoText={logo.text}
          showFullText={true}
        />

        {/* Right: Menu only */}
        {mobileMenu ? (
          mobileMenu
        ) : mobileMenuContent ? (
          <MobileMenu side="right">
            {mobileMenuContent}
          </MobileMenu>
        ) : null}
      </div>

      {/* Tablet/Desktop Layout */}
      <div className="hidden w-full items-center justify-between gap-[var(--space-6)] md:flex">
        {/* Logo */}
        <HeaderLogo href={logo.href} logoText={logo.text} />

        {/* Search */}
        {search && (
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
            <HeaderSearch
              placeholder={search.placeholder}
              value={searchValue}
              onChange={handleSearchChange}
              onClear={() => setSearchValue('')}
            />
          </form>
        )}

        {/* Actions */}
        {actions && <HeaderActions>{actions}</HeaderActions>}
      </div>
    </HeaderBase>
  );
}