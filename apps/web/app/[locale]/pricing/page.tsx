import { Button } from '@repo/design-system/components';
import { Heart, HelpCircle, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { createMetadata } from '@repo/seo/metadata';
import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Pricing - Sell on Threadly | Free to List, Only Pay When You Sell',
    description: 'Learn about Threadly\'s transparent pricing. Free to list your items, only pay a small commission when you sell. No hidden fees, no monthly charges.',
    keywords: [
      'threadly pricing',
      'sell clothes online',
      'commission fees',
      'free to list',
      'selling fees',
      'marketplace pricing',
      'sustainable fashion',
      'consignment fees',
    ],
    openGraph: {
      title: 'Pricing - Sell on Threadly',
      description: 'Turn your unworn clothes into cash. Free to list, only pay when you sell.',
      type: 'website',
      images: [
        {
          url: '/images/pricing-hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Threadly Pricing Information',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pricing - Sell on Threadly',
      description: 'Free to list your items, only pay a small commission when you sell.',
      images: ['/images/pricing-hero.jpg'],
    },
  });
}

const SellingInfo = () => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center gap-12 text-center">
        {/* Header */}
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-center font-bold text-4xl tracking-tighter md:text-6xl">
            Sell on Threadly
          </h1>
          <p className="text-center text-muted-foreground text-xl leading-relaxed">
            Turn your unworn clothes into cash while contributing to sustainable
            fashion. It's completely free to list, and you only pay when you
            sell.
          </p>
        </div>

        {/* How it Works */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
              <span className="font-bold text-2xl text-purple-600">1</span>
            </div>
            <h3 className="font-semibold text-xl">List Your Items</h3>
            <p className="text-muted-foreground">
              Upload photos, add descriptions, and set your price. Listing is
              always free.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
              <span className="font-bold text-2xl text-purple-600">2</span>
            </div>
            <h3 className="font-semibold text-xl">Connect with Buyers</h3>
            <p className="text-muted-foreground">
              Chat with interested buyers and answer questions about your items.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
              <span className="font-bold text-2xl text-purple-600">3</span>
            </div>
            <h3 className="font-semibold text-xl">Get Paid</h3>
            <p className="text-muted-foreground">
              Once sold and delivered, funds are released to your account minus
              our small commission.
            </p>
          </div>
        </div>

        {/* Fees Structure */}
        <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8">
          <h2 className="mb-6 text-center font-bold text-2xl">
            Simple, Fair Fees
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="text-center">
              <div className="mb-2 font-bold text-4xl text-purple-600">
                Free
              </div>
              <div className="mb-2 font-semibold text-lg">Listing Items</div>
              <div className="text-muted-foreground text-sm">
                No upfront costs to list your clothes
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-4xl text-purple-600">
                Small %
              </div>
              <div className="mb-2 font-semibold text-lg">When You Sell</div>
              <div className="text-muted-foreground text-sm">
                Commission only on successful sales
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-4 text-center">
            <Shield className="h-12 w-12 text-purple-600" />
            <h3 className="font-semibold text-xl">Seller Protection</h3>
            <p className="text-muted-foreground">
              Protected payments and dispute resolution to keep your
              transactions safe.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <Heart className="h-12 w-12 text-pink-600" />
            <h3 className="font-semibold text-xl">Sustainable Impact</h3>
            <p className="text-muted-foreground">
              Help reduce fashion waste by giving your clothes a second life.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <Zap className="h-12 w-12 text-orange-600" />
            <h3 className="font-semibold text-xl">Quick & Easy</h3>
            <p className="text-muted-foreground">
              List items in minutes with our streamlined selling process.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            className="gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg text-background hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Link href="/auth/register">Start Selling Today</Link>
          </Button>

          <Button
            asChild
            className="gap-3 px-8 py-6 text-lg"
            size="lg"
            variant="outline"
          >
            <Link href="/contact">
              <HelpCircle className="h-5 w-5" />
              Questions? Contact Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default SellingInfo;
