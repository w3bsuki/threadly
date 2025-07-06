import { Button } from '@repo/design-system/components';
import { Shield, Heart, Zap, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const SellingInfo = () => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center gap-12 text-center">
        {/* Header */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="text-center font-bold text-4xl tracking-tighter md:text-6xl">
            Sell on Threadly
          </h1>
          <p className="text-center text-xl text-muted-foreground leading-relaxed">
            Turn your unworn clothes into cash while contributing to sustainable fashion. 
            It's completely free to list, and you only pay when you sell.
          </p>
        </div>

        {/* How it Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="flex flex-col items-center text-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="text-xl font-semibold">List Your Items</h3>
            <p className="text-muted-foreground">
              Upload photos, add descriptions, and set your price. Listing is always free.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-semibold">Connect with Buyers</h3>
            <p className="text-muted-foreground">
              Chat with interested buyers and answer questions about your items.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold">Get Paid</h3>
            <p className="text-muted-foreground">
              Once sold and delivered, funds are released to your account minus our small commission.
            </p>
          </div>
        </div>

        {/* Fees Structure */}
        <div className="w-full max-w-2xl bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Simple, Fair Fees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">Free</div>
              <div className="text-lg font-semibold mb-2">Listing Items</div>
              <div className="text-muted-foreground text-sm">
                No upfront costs to list your clothes
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">Small %</div>
              <div className="text-lg font-semibold mb-2">When You Sell</div>
              <div className="text-muted-foreground text-sm">
                Commission only on successful sales
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="flex flex-col items-center text-center gap-4">
            <Shield className="w-12 h-12 text-purple-600" />
            <h3 className="text-xl font-semibold">Seller Protection</h3>
            <p className="text-muted-foreground">
              Protected payments and dispute resolution to keep your transactions safe.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4">
            <Heart className="w-12 h-12 text-pink-600" />
            <h3 className="text-xl font-semibold">Sustainable Impact</h3>
            <p className="text-muted-foreground">
              Help reduce fashion waste by giving your clothes a second life.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4">
            <Zap className="w-12 h-12 text-orange-600" />
            <h3 className="text-xl font-semibold">Quick & Easy</h3>
            <p className="text-muted-foreground">
              List items in minutes with our streamlined selling process.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg text-white hover:from-purple-700 hover:to-pink-700" asChild>
            <Link href="/auth/register">
              Start Selling Today
            </Link>
          </Button>
          
          <Button size="lg" variant="outline" className="gap-3 px-8 py-6 text-lg" asChild>
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
