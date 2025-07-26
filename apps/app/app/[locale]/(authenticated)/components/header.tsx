'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
} from '@repo/design-system/components';
import { AccountDropdown } from '@repo/design-system/components/navigation';
import { Fragment, type ReactNode } from 'react';
import { NotificationBell } from './notification-bell';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { Dictionary } from '@repo/internationalization';
import { useUser, useClerk } from '@repo/auth/client';
import { useParams, useRouter } from 'next/navigation';

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
  dictionary: Dictionary;
};

export function Header({ pages, page, children, dictionary }: HeaderProps) {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string || 'en';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2">
      <div className="flex items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {pages.map((page, index) => (
              <Fragment key={page}>
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{page}</BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            ))}
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-4">
        <LanguageSwitcher />
        <NotificationBell />
        <AccountDropdown
          isSignedIn={isSignedIn}
          user={user ? {
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || undefined,
            email: user.emailAddresses?.[0]?.emailAddress,
          } : undefined}
          locale={locale}
          dictionary={{
            profile: dictionary.dashboard?.navigation?.profile || 'Profile',
            orders: dictionary.dashboard?.navigation?.sellerDashboard || 'Seller Dashboard',
            settings: dictionary.dashboard?.navigation?.settings || 'Settings',
            signOut: dictionary.auth?.signOut || 'Sign Out',
            signIn: dictionary.auth?.signIn || 'Sign In',
            createAccount: dictionary.auth?.createAccount || 'Create Account',
          }}
          onSignOut={async () => {
            await signOut();
            router.push(`/${locale}/sign-in`);
          }}
        />
        {children}
      </div>
    </header>
  );
}
