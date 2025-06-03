import { Button } from '@repo/design-system/components/ui/button';
import type { Dictionary } from '@repo/internationalization';
import { Search, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = async ({ dictionary }: HeroProps) => (
  <div className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-32">
        {/* Main Heading */}
        <div className="flex flex-col gap-6 text-center">
          <div className="flex items-center justify-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Sustainable Fashion Marketplace
            </span>
          </div>
          
          <h1 className="max-w-4xl text-center font-bold text-5xl tracking-tight md:text-7xl lg:text-8xl">
            Your Style,{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          
          <p className="max-w-2xl text-center text-lg text-gray-600 leading-relaxed md:text-xl">
            Discover unique fashion finds, sell your pre-loved treasures, and join a community that believes in sustainable style.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for brands, styles, or categories..."
              className="w-full rounded-full border border-gray-200 bg-white/80 py-4 pl-12 pr-32 text-lg backdrop-blur-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
            />
            <Button 
              size="lg" 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-white hover:from-purple-700 hover:to-pink-700"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Items Listed</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-pink-100 p-2">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">25K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-100 p-2">
              <Sparkles className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">1000+</div>
              <div className="text-sm text-gray-600">New Daily</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg text-white hover:from-purple-700 hover:to-pink-700" asChild>
            <Link href="/products">
              <ShoppingBag className="h-5 w-5" />
              Start Shopping
            </Link>
          </Button>
          
          <Button size="lg" variant="outline" className="gap-3 border-purple-200 px-8 py-6 text-lg hover:bg-purple-50" asChild>
            <Link href="/auth/register">
              <Sparkles className="h-5 w-5" />
              Sell Your Items
            </Link>
          </Button>
        </div>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="text-sm text-gray-500">Popular:</span>
          {['Vintage Denim', 'Designer Bags', 'Summer Dresses', 'Sneakers', 'Accessories'].map((term) => (
            <Link 
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full bg-white/60 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-white/80 hover:text-purple-600"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);
