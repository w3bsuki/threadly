import { ProductGrid } from '../(home)/components/product-grid';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Crown, Shield, Star, Award, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Inline ProductPlaceholder component
const ProductPlaceholder = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative ${className}`}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-300"
      >
        {/* Clothing Hanger */}
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Hanger Hook */}
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* T-shirt Shape */}
        <path
          d="M25 28 L25 35 C25 37, 27 39, 29 39 L51 39 C53 39, 55 37, 55 35 L55 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* T-shirt Body */}
        <rect
          x="30"
          y="35"
          width="20"
          height="30"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* Sleeves */}
        <path
          d="M25 28 L20 32 C18 34, 18 36, 20 38 L22 40 C23 41, 25 40, 25 38 L25 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        <path
          d="M55 28 L60 32 C62 34, 62 36, 60 38 L58 40 C57 41, 55 40, 55 38 L55 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* Decorative Elements */}
        <circle cx="35" cy="45" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="40" cy="48" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="45" cy="45" r="1" fill="currentColor" opacity="0.3" />
      </svg>
      
      {/* Subtle text */}
      <div className="absolute bottom-4 text-xs text-gray-400 font-medium">
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
    description: 'Every designer item is verified by our authentication experts'
  },
  {
    icon: Star,
    title: 'Premium Condition',
    description: 'Curated selection focusing on Like New and Excellent condition'
  },
  {
    icon: Award,
    title: 'Luxury Experience',
    description: 'White-glove service for high-value designer transactions'
  }
];

export default function DesignerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Hero Section with Gold Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-500/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-12 w-12 text-amber-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Designer
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent ml-3">
                  Marketplace
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover authenticated luxury fashion from the world's most coveted designers. 
              Every piece is verified, every transaction is protected.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 font-semibold px-8 py-3"
              >
                <Crown className="h-5 w-5 mr-2" />
                Shop Designer
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold px-8 py-3"
              >
                Sell Designer Items
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Designer Brands Grid */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Designer Brands</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse authenticated pieces from the world's most prestigious luxury fashion houses
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {designerBrands.map((brand) => (
              <Link 
                key={brand.name}
                href={`/designer/${brand.name.toLowerCase().replace(' ', '-')}`}
                className="group"
              >
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-amber-200">
                  <div className="aspect-[2/1] mb-4 bg-gray-100 rounded overflow-hidden">
                    <ProductPlaceholder className="w-full h-full" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">{brand.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{brand.items} items available</p>
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-0">
                      <Crown className="h-3 w-3 mr-1" />
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Latest Designer Arrivals</h2>
            <Button variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
              View All Designer Items
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {/* Use existing ProductGrid with designer filter */}
          <ProductGrid category="designer" />
        </div>
      </div>
    </div>
  );
} 