'use client';

import { Button } from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import { Heart, Search, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MobileButton } from '@/components/mobile/mobile-button';
import { SignInCTA } from '@/components/sign-in-cta';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = ({ dictionary }: HeroProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      hapticFeedback.medium();
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6 py-12 sm:py-16 md:py-20 lg:py-32">
          {/* Main Heading */}
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto flex items-center justify-center gap-2 rounded-full bg-white/80 px-3 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span className="font-medium text-purple-700 text-xs sm:text-sm">
                Sustainable Fashion Marketplace
              </span>
            </div>

            <h1 className="max-w-4xl text-center font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
              Your Style,{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="max-w-2xl px-4 text-center text-base text-gray-600 leading-relaxed sm:text-lg md:text-xl">
              Discover unique fashion finds, sell your pre-loved treasures, and
              join a community that believes in sustainable style.
            </p>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <form
            className="w-full max-w-2xl px-4"
            method="get"
            onSubmit={handleSearch}
          >
            <div className="relative flex flex-col gap-2 sm:flex-row sm:gap-0">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
                <input
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pr-4 pl-10 text-base backdrop-blur-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 sm:rounded-r-none sm:rounded-l-full sm:py-4 sm:pl-12 sm:text-lg"
                  name="q"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands, styles..."
                  type="search"
                  value={searchQuery}
                />
              </div>
              <MobileButton
                className="w-full border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 sm:w-auto sm:rounded-r-full sm:rounded-l-none"
                importance="primary"
                touchSize="comfortable"
                type="submit"
              >
                Search
              </MobileButton>
            </div>
          </form>

          {/* Value Highlights - Mobile Stacked */}
          <div className="grid w-full max-w-2xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:gap-6">
            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
              <div className="shrink-0 rounded-full bg-purple-100 p-2">
                <ShoppingBag className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">
                  Curated Selection
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  Quality verified items
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
              <div className="shrink-0 rounded-full bg-pink-100 p-2">
                <Heart className="h-4 w-4 text-pink-600 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">
                  Sustainable Choice
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  Eco-friendly fashion
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
              <div className="shrink-0 rounded-full bg-orange-100 p-2">
                <Sparkles className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">
                  Unique Finds
                </div>
                <div className="text-gray-600 text-xs sm:text-sm">
                  One-of-a-kind pieces
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="flex w-full max-w-md flex-col gap-3 px-4 sm:flex-row">
            <Link className="flex-1" href="/products">
              <MobileButton
                asChild
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                importance="critical"
                touchSize="large"
              >
                <span className="flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  Start Shopping
                </span>
              </MobileButton>
            </Link>

            <SignInCTA
              className="min-h-[56px] flex-1 gap-2 border-purple-200 hover:bg-purple-50"
              redirectPath="/selling/new"
              size="lg"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              Sell Your Items
            </SignInCTA>
          </div>

          {/* Popular Searches - Touch Friendly */}
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              <span className="text-gray-500 text-xs sm:text-sm">Popular:</span>
              {[
                'Vintage Denim',
                'Designer Bags',
                'Summer Dresses',
                'Sneakers',
                'Accessories',
              ].map((term) => (
                <Link
                  className="inline-flex min-h-[36px] touch-manipulation items-center justify-center rounded-full bg-white/60 px-4 py-2 text-gray-700 text-xs transition-all hover:bg-white/80 hover:text-purple-600 active:scale-95 sm:text-sm"
                  href={`/search?q=${encodeURIComponent(term)}`}
                  key={term}
                  onClick={() => hapticFeedback.light()}
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
