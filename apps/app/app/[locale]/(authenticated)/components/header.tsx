import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { Fragment, type ReactNode } from 'react';
import { NotificationBell } from './notification-bell';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { Dictionary } from '@repo/internationalization';

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
  dictionary: Dictionary;
};

export const Header = ({ pages, page, children, dictionary }: HeaderProps): React.JSX.Element => (
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
      {children}
    </div>
  </header>
);
