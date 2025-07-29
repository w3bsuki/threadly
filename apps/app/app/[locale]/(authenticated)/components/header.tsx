'use client';

import { useClerk, useUser } from '@repo/auth/client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
} from '@repo/ui/components';
import { AccountDropdown } from '@repo/ui/components/navigation';
import type { Dictionary } from '@repo/internationalization';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, type ReactNode } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NotificationBell } from './notification-bell';

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
  const locale = (params.locale as string) || 'en';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2">
      <div className="flex items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {pages.map((page, index) => (
              <Fragment key={page}>
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
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
          dictionary={{
            profile: dictionary.dashboard?.navigation?.profile || 'Profile',
            orders:
              dictionary.dashboard?.navigation?.sellerDashboard ||
              'Seller Dashboard',
            settings: dictionary.dashboard?.navigation?.settings || 'Settings',
            signOut: dictionary.auth?.signOut || 'Sign Out',
            signIn: dictionary.auth?.signIn || 'Sign In',
            createAccount: dictionary.auth?.createAccount || 'Create Account',
          }}
          isSignedIn={isSignedIn}
          locale={locale}
          onSignOut={async () => {
            await signOut();
            router.push(`/${locale}/sign-in`);
          }}
          user={
            user
              ? {
                  name:
                    user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || undefined,
                  email: user.emailAddresses?.[0]?.emailAddress,
                }
              : undefined
          }
        />
        {children}
      </div>
    </header>
  );
}
