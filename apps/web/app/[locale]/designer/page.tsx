import { Badge, Button } from '@repo/ui/components';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { Award, ChevronRight, Crown, Shield, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '../(home)/components/product-grid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Designer Marketplace - Authenticated Luxury Fashion | Threadly',
    description:
      'Shop authenticated luxury designer fashion from Gucci, Chanel, Prada, Louis Vuitton, and more. Every piece is verified by our authentication experts.',
    keywords: [
      'designer fashion',
      'luxury fashion',
      'authenticated designer',
      'Gucci',
      'Chanel',
      'Prada',
      'Louis Vuitton',
      'Hermès',
      'Dior',
      'Balenciaga',
      'Saint Laurent',
      'designer consignment',
      'luxury marketplace',
      'authenticated luxury',
    ],
    openGraph: {
      title: 'Designer Marketplace - Authenticated Luxury Fashion',
      description:
        "Discover authenticated luxury fashion from the world's most coveted designers. Every piece is verified, every transaction is protected.",
      type: 'website',
      images: [
        {
          url: '/images/designer-hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Luxury Designer Fashion Collection',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Designer Marketplace - Threadly',
      description:
        "Shop authenticated luxury designer fashion from the world's most prestigious brands.",
      images: ['/images/designer-hero.jpg'],
    },
  });
}

// Inline ProductPlaceholder component
const ProductPlaceholder = ({
  className = 'w-full h-full',
}: {
  className?: string;
}) => {
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      <svg
        className="text-gray-300"
        fill="none"
        height="80"
        viewBox="0 0 80 80"
        width="80"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Clothing Hanger */}
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />

        {/* Hanger Hook */}
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />

        {/* T-shirt Shape */}
        <path
          d="M25 28 L25 35 C25 37, 27 39, 29 39 L51 39 C53 39, 55 37, 55 35 L55 28"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />

        {/* T-shirt Body */}
        <rect
          fill="currentColor"
          fillOpacity="0.1"
          height="30"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          width="20"
          x="30"
          y="35"
        />

        {/* Sleeves */}
        <path
          d="M25 28 L20 32 C18 34, 18 36, 20 38 L22 40 C23 41, 25 40, 25 38 L25 35"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />

        <path
          d="M55 28 L60 32 C62 34, 62 36, 60 38 L58 40 C57 41, 55 40, 55 38 L55 35"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />

        {/* Decorative Elements */}
        <circle cx="35" cy="45" fill="currentColor" opacity="0.3" r="1" />
        <circle cx="40" cy="48" fill="currentColor" opacity="0.3" r="1" />
        <circle cx="45" cy="45" fill="currentColor" opacity="0.3" r="1" />
      </svg>

      {/* Subtle text */}
      <div className="absolute bottom-4 font-medium text-gray-400 text-xs">
        Threadly
      </div>
    </div>
  );
};

const designerBrands = [
  { name: 'Gucci', items: 45 },
  { name: 'Chanel', items: 32 },
  { name: 'Prada', items: 28 },
  { name: 'Louis Vuitton', items: 67 },
  { name: 'Hermès', items: 23 },
  { name: 'Dior', items: 41 },
  { name: 'Balenciaga', items: 19 },
  { name: 'Saint Laurent', items: 35 },
];

const features = [
  {
    icon: Shield,
    title: 'Authentication Guaranteed',
    description:
      'Every designer item is verified by our authentication experts',
  },
  {
    icon: Star,
    title: 'Premium Condition',
    description:
      'Curated selection focusing on Like New and Excellent condition',
  },
  {
    icon: Award,
    title: 'Luxury Experience',
    description: 'White-glove service for high-value designer transactions',
  },
];

export default function DesignerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Hero Section with Gold Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-500/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center">
              <Crown className="mr-3 h-12 w-12 text-amber-400" />
              <h1 className="font-bold text-4xl text-white md:text-6xl">
                Designer
                <span className="ml-3 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Marketplace
                </span>
              </h1>
            </div>
            <p className="mx-auto mb-8 max-w-3xl text-gray-300 text-xl">
              Discover authenticated luxury fashion from the world's most
              coveted designers. Every piece is verified, every transaction is
              protected.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              <Button
                className="bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-3 font-semibold text-black hover:from-amber-500 hover:to-yellow-600"
                size="lg"
              >
                <Crown className="mr-2 h-5 w-5" />
                Shop Designer
              </Button>
              <Button
                className="border-amber-400 px-8 py-3 font-semibold text-amber-400 hover:bg-amber-400 hover:text-black"
                size="lg"
                variant="outline"
              >
                Sell Designer Items
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div className="text-center" key={feature.title}>
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500">
                  <feature.icon className="h-8 w-8 text-black" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Designer Brands Grid */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900">
              Featured Designer Brands
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Browse authenticated pieces from the world's most prestigious
              luxury fashion houses
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {designerBrands.map((brand) => (
              <Link
                className="group"
                href={`/designer/${brand.name.toLowerCase().replace(' ', '-')}`}
                key={brand.name}
              >
                <div className="rounded-lg border-2 border-transparent bg-white p-6 shadow-sm transition-shadow hover:border-amber-200 hover:shadow-md">
                  <div className="mb-4 aspect-[2/1] overflow-hidden rounded bg-gray-100">
                    <ProductPlaceholder className="h-full w-full" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-1 font-semibold text-gray-900">
                      {brand.name}
                    </h3>
                    <p className="mb-2 text-gray-500 text-sm">
                      {brand.items} items available
                    </p>
                    <Badge className="border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-black">
                      <Crown className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Designer Products Grid */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-bold text-2xl text-gray-900">
              Latest Designer Arrivals
            </h2>
            <Button
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
              variant="outline"
            >
              View All Designer Items
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {/* Use existing ProductGrid with designer filter */}
          <ProductGrid category="designer" />
        </div>
      </div>
    </div>
  );
}
