import { SignInButton, useUser } from '@repo/auth/auth/client';
import { Button } from '@repo/ui/components';
import { Heart, Plus, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';
import { SafeUserButton } from '../../../app/[locale]/components/header/safe-user-button';
import { CategoryMenu } from './category-menu';

interface Category {
  name: string;
  href: string;
  icon: string;
  subcategories: Array<{
    name: string;
    href: string;
    icon: string;
    popular?: boolean;
  }>;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  expandedCategories: string[];
  onToggleExpansion: (categoryName: string) => void;
  locale: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  categories,
  expandedCategories,
  onToggleExpansion,
  locale,
}: MobileMenuProps) {
  const { isSignedIn, user } = useUser();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        aria-hidden="true"
        className="fade-in-0 absolute inset-0 animate-in bg-foreground/80 duration-200"
        onClick={onClose}
      />

      <div
        aria-label="Navigation menu"
        aria-modal="true"
        className="slide-in-from-top relative flex h-full animate-in flex-col bg-background duration-300"
        id="mobile-menu"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b p-4">
          <Link href="/" onClick={onClose}>
            <span className="font-bold text-xl">Threadly</span>
          </Link>
          <Button
            aria-label="Close navigation menu"
            className="h-10 w-10"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b p-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <SafeUserButton />
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    View your profile
                  </p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button className="h-14 w-full text-base" variant="outline">
                  <User className="mr-3 h-5 w-5" />
                  Sign In / Join
                </Button>
              </SignInButton>
            )}
          </div>

          <CategoryMenu
            categories={categories}
            expandedCategories={expandedCategories}
            onClose={onClose}
            onToggleExpansion={onToggleExpansion}
            variant="mobile"
          />

          <div className="space-y-3 p-4">
            <Link
              className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-pink-50 p-4 transition-all hover:bg-pink-100 active:scale-95"
              href="/favorites"
              onClick={onClose}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-pink-100">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Saved Items</p>
                <p className="text-muted-foreground text-sm">
                  Your wishlist & favorites
                </p>
              </div>
            </Link>

            <Link
              className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-blue-50 p-4 transition-all hover:bg-blue-100 active:scale-95"
              href="/products"
              onClick={onClose}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Browse All</p>
                <p className="text-muted-foreground text-sm">
                  Explore everything
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="border-t bg-muted p-4">
          {isSignedIn ? (
            <Button
              asChild
              className="h-14 w-full bg-foreground font-medium text-background text-base hover:bg-secondary-foreground"
            >
              <Link href={`/${locale}/selling/new`} onClick={onClose}>
                <Plus className="mr-2 h-5 w-5" />
                Start Selling
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-14 w-full bg-foreground font-medium text-background text-base hover:bg-secondary-foreground"
            >
              <Link href={`/${locale}/sign-in`} onClick={onClose}>
                <Plus className="mr-2 h-5 w-5" />
                Start Selling
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
