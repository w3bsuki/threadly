import * as React from 'react';
import { Button } from '@repo/design-system/components';
import { ArrowRight, Star, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

type CTAProps = {
  dictionary: Dictionary;
};

export const CTA: React.FC<CTAProps> = async ({ dictionary }: CTAProps) => (
  <section className="w-full bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 py-16 lg:py-24">
    <div className="container mx-auto px-4">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Content */}
        <div className="text-white">
          <div className="mb-6">
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl lg:text-6xl">
              Join the Fashion Revolution
            </h2>
            <p className="text-lg text-purple-100 leading-relaxed md:text-xl">
              Be part of a community that's changing how the world shops for fashion. 
              Sustainable, affordable, and stylish – that's the Threadly way.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="mb-8 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-2 font-bold text-2xl md:text-3xl">✓</div>
              <div className="text-sm text-purple-200">Verified Quality</div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-2xl md:text-3xl">♻️</div>
              <div className="text-sm text-purple-200">Eco-Friendly</div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-2xl md:text-3xl">🛡️</div>
              <div className="text-sm text-purple-200">Secure Platform</div>
            </div>
          </div>

          {/* Community Message */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400"
                />
              ))}
            </div>
            <div>
              <div className="font-medium">Join our growing fashion community</div>
              <div className="text-sm text-purple-200">Discover unique style, sustainably</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="gap-3 bg-white px-8 py-6 text-lg text-purple-900 hover:bg-gray-50"
              asChild
            >
              <Link href="/auth/register">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-3 border-white px-8 py-6 text-lg text-white hover:bg-white/10"
              asChild
            >
              <Link href="/products">
                Browse Items
              </Link>
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-lg text-white">Premium Quality</h3>
            <p className="text-sm text-purple-100">
              Every item is verified for authenticity and quality before listing
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-lg text-white">Trusted Community</h3>
            <p className="text-sm text-purple-100">
              Connect with verified sellers and buyers in a safe environment
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-lg text-white">Best Prices</h3>
            <p className="text-sm text-purple-100">
              Find designer pieces at up to 70% off retail prices
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-lg text-white">Fast & Easy</h3>
            <p className="text-sm text-purple-100">
              List items in minutes, buy with one click, ship with confidence
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-16 rounded-2xl border border-white/20 bg-white/5 p-6 text-center backdrop-blur-sm md:p-8">
        <h3 className="mb-2 font-bold text-xl text-white md:text-2xl">
          🌱 Start Your Sustainable Fashion Journey
        </h3>
        <p className="text-purple-100">
          Every purchase and sale contributes to a more sustainable future for fashion
        </p>
      </div>
    </div>
  </section>
);
