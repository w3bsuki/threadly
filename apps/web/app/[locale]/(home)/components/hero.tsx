'use client';

import { Button } from '@repo/design-system/components';
import type { Dictionary } from '@repo/internationalization';
import { Heart, Search, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SignInCTA } from '@/components/sign-in-cta';

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = ({ dictionary }: HeroProps) => {
  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-32">
          {/* Main Heading */}
          <div className="flex flex-col gap-6 text-center">
            <div className="flex items-center justify-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-700 text-sm">
                Sustainable Fashion Marketplace
              </span>
            </div>

            <h1 className="max-w-4xl text-center font-bold text-5xl tracking-tight md:text-7xl lg:text-8xl">
              Your Style,{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="max-w-2xl text-center text-gray-600 text-lg leading-relaxed md:text-xl">
              Discover unique fashion finds, sell your pre-loved treasures, and
              join a community that believes in sustainable style.
            </p>
          </div>

          {/* Search Bar */}
          <form action="/search" className="w-full max-w-2xl" method="get">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
              <input
                className="w-full rounded-full border border-gray-200 bg-white/80 py-4 pr-32 pl-12 text-lg backdrop-blur-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                name="q"
                placeholder="Search for brands, styles, or categories..."
                type="text"
              />
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-white hover:from-purple-700 hover:to-pink-700"
                size="lg"
                type="submit"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Value Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Curated Selection
                </div>
                <div className="text-gray-600 text-sm">
                  Quality verified items
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-pink-100 p-2">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Sustainable Choice
                </div>
                <div className="text-gray-600 text-sm">
                  Eco-friendly fashion
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Unique Finds</div>
                <div className="text-gray-600 text-sm">
                  One-of-a-kind pieces
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              className="gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg text-white hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Link href="/products">
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </Link>
            </Button>

            <SignInCTA
              className="gap-3 border-purple-200 px-8 py-6 text-lg hover:bg-purple-50"
              redirectPath="/selling/new"
              size="lg"
              variant="outline"
            >
              <Sparkles className="h-5 w-5" />
              Sell Your Items
            </SignInCTA>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            <span className="text-gray-500 text-sm">Popular:</span>
            {[
              'Vintage Denim',
              'Designer Bags',
              'Summer Dresses',
              'Sneakers',
              'Accessories',
            ].map((term) => (
              <Link
                className="rounded-full bg-white/60 px-4 py-2 text-gray-700 text-sm transition-colors hover:bg-white/80 hover:text-purple-600"
                href={`/search?q=${encodeURIComponent(term)}`}
                key={term}
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
