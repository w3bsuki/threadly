import type { Dictionary } from '@repo/internationalization';
import { Recycle, Shield, Heart, Sparkles } from 'lucide-react';

type TestimonialsProps = {
  dictionary: Dictionary;
};

const values = [
  {
    icon: Recycle,
    title: "Sustainable Fashion",
    description: "Give clothes a second life and reduce fashion waste. Every purchase contributes to a more sustainable future.",
    color: "text-green-600 bg-green-100"
  },
  {
    icon: Shield,
    title: "Verified Quality",
    description: "Our authenticity verification ensures you get genuine, high-quality items every time you shop.",
    color: "text-blue-600 bg-blue-100"
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "Connect with fashion lovers who share your passion for unique style and sustainable shopping.",
    color: "text-pink-600 bg-pink-100"
  },
  {
    icon: Sparkles,
    title: "Unique Finds",
    description: "Discover one-of-a-kind pieces, vintage treasures, and designer items you won't find anywhere else.",
    color: "text-purple-600 bg-purple-100"
  }
];

export const Testimonials = ({ dictionary }: TestimonialsProps): React.ReactElement => {
  return (
    <section className="w-full bg-gradient-to-br from-purple-50 to-pink-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-12">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
              Why Choose Threadly?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              A marketplace built for fashion lovers who care about style, quality, and sustainability
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`p-4 rounded-full ${value.color} mb-4`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">
              Ready to discover your next favorite piece?
            </p>
            <p className="text-gray-600">
              Join our growing community of fashion enthusiasts who prioritize quality and sustainability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
