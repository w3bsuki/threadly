import { Button } from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import {
  Camera,
  Heart,
  MessageCircle,
  Search,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

type HowItWorksProps = {
  dictionary: Dictionary;
};

const steps = [
  {
    id: 1,
    icon: Search,
    title: 'Discover',
    description:
      'Browse thousands of unique fashion items or search for exactly what you want',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 2,
    icon: Heart,
    title: 'Love It',
    description:
      'Found something perfect? Save it to your favorites or buy it instantly',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
  },
  {
    id: 3,
    icon: MessageCircle,
    title: 'Connect',
    description:
      'Chat with sellers, ask questions, and negotiate prices directly',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 4,
    icon: ShoppingBag,
    title: 'Get It',
    description:
      'Secure payment, fast shipping, and buyer protection on every purchase',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
  },
];

const sellingSteps = [
  {
    id: 1,
    icon: Camera,
    title: 'Photo & List',
    description: 'Take photos and create your listing in under 2 minutes',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 2,
    icon: Zap,
    title: 'Get Noticed',
    description: 'Your item goes live instantly to our active community',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 3,
    icon: MessageCircle,
    title: 'Sell Fast',
    description: 'Chat with interested buyers and close the deal',
    color: 'from-teal-500 to-cyan-500',
  },
];

export const HowItWorks = async ({ dictionary }: HowItWorksProps) => {
  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-bold text-3xl tracking-tight md:text-5xl">
            How Threadly Works
          </h2>
          <p className="mx-auto max-w-3xl text-gray-600 text-lg">
            Whether you're buying or selling, we've made it simple, safe, and
            fun to find your perfect fashion match
          </p>
        </div>

        {/* Buying Process */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h3 className="mb-4 font-bold text-2xl text-gray-900 md:text-3xl">
              For Buyers
            </h3>
            <p className="text-gray-600">
              Find your next favorite fashion piece in 4 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div className="relative" key={step.id}>
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-1/2 hidden h-px w-full bg-gradient-to-r from-gray-300 to-transparent lg:block" />
                )}

                <div
                  className={`relative rounded-2xl ${step.bgColor} hover:-translate-y-1 p-6 text-center transition-all duration-300 hover:shadow-lg`}
                >
                  {/* Step Number */}
                  <div className="-top-3 -translate-x-1/2 absolute left-1/2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${step.color} font-bold text-white text-xs`}
                    >
                      {step.id}
                    </div>
                  </div>

                  {/* Icon */}
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${step.color}`}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h4 className="mb-3 font-bold text-gray-900 text-lg">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selling Process */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h3 className="mb-4 font-bold text-2xl text-gray-900 md:text-3xl">
              For Sellers
            </h3>
            <p className="text-gray-600">
              Turn your closet into cash with our streamlined selling process
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {sellingSteps.map((step, index) => (
              <div className="relative" key={step.id}>
                {/* Connecting Line */}
                {index < sellingSteps.length - 1 && (
                  <div className="absolute top-12 left-1/2 hidden h-px w-full bg-gradient-to-r from-gray-300 to-transparent md:block" />
                )}

                <div className="hover:-translate-y-1 relative rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
                  {/* Step Number */}
                  <div className="-top-4 -translate-x-1/2 absolute left-1/2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${step.color} font-bold text-sm text-white`}
                    >
                      {step.id}
                    </div>
                  </div>

                  {/* Icon */}
                  <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r ${step.color}`}
                  >
                    <step.icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Content */}
                  <h4 className="mb-4 font-bold text-gray-900 text-xl">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white md:p-12">
          <h3 className="mb-4 font-bold text-2xl md:text-3xl">
            Ready to Start Your Fashion Journey?
          </h3>
          <p className="mb-8 text-lg text-purple-100">
            Join thousands of fashion lovers buying and selling on Threadly
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="gap-2 bg-white px-8 py-6 text-lg text-purple-600 hover:bg-gray-50"
              size="lg"
              variant="secondary"
            >
              <Link href="/products">
                <Search className="h-5 w-5" />
                Start Shopping
              </Link>
            </Button>

            <Button
              asChild
              className="gap-2 border-white px-8 py-6 text-lg text-white hover:bg-white/10"
              size="lg"
              variant="outline"
            >
              <Link href="/auth/register">
                <Camera className="h-5 w-5" />
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
