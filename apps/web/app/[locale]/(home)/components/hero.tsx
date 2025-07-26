'use client';

import { Button } from '@repo/design-system/components';
import type { Dictionary } from '@repo/internationalization';
import { Heart, Search, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SignInCTA } from '@/components/sign-in-cta';
import { MobileButton } from '@/components/mobile/mobile-button';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
            <div className="flex items-center justify-center gap-2 rounded-full bg-white/80 px-3 py-1.5 backdrop-blur-sm mx-auto">
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

            <p className="max-w-2xl text-center text-gray-600 text-base leading-relaxed sm:text-lg md:text-xl px-4">
              Discover unique fashion finds, sell your pre-loved treasures, and
              join a community that believes in sustainable style.
            </p>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl px-4" method="get">
            <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  className="w-full rounded-lg sm:rounded-l-full sm:rounded-r-none border border-gray-200 bg-white/80 py-3 sm:py-4 pr-4 pl-10 sm:pl-12 text-base sm:text-lg backdrop-blur-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands, styles..."
                  type="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
              <MobileButton
                className="w-full sm:w-auto sm:rounded-l-none sm:rounded-r-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-0"
                touchSize="comfortable"
                importance="primary"
                type="submit"
              >
                Search
              </MobileButton>
            </div>
          </form>

          {/* Value Highlights - Mobile Stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl px-4">
            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 backdrop-blur-sm">
              <div className="rounded-full bg-purple-100 p-2 shrink-0">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
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

            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 backdrop-blur-sm">
              <div className="rounded-full bg-pink-100 p-2 shrink-0">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
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

            <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3 backdrop-blur-sm">
              <div className="rounded-full bg-orange-100 p-2 shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
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
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md px-4">
            <Link href="/products" className="flex-1">
              <MobileButton
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                touchSize="large"
                importance="critical"
                asChild
              >
                <span className="flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  Start Shopping
                </span>
              </MobileButton>
            </Link>

            <SignInCTA
              className="flex-1 gap-2 border-purple-200 hover:bg-purple-50 min-h-[56px]"
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
                  className="inline-flex items-center justify-center min-h-[36px] rounded-full bg-white/60 px-4 py-2 text-gray-700 text-xs sm:text-sm transition-all hover:bg-white/80 hover:text-purple-600 active:scale-95 touch-manipulation"
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
