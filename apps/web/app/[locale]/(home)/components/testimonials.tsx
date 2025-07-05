'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@repo/design-system/components';
import type { Dictionary } from '@repo/internationalization';
import { Star, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';

type TestimonialsProps = {
  dictionary: Dictionary;
};

const testimonials = [
  {
    title: "Found my dream vintage jacket!",
    description: "I've been searching for a specific 90s denim jacket for months. Found it on Threadly in perfect condition and at an amazing price. The seller was so lovely too!",
    author: {
      name: "Sarah Chen",
      image: "/api/placeholder/40/40",
      location: "London",
      rating: 5,
    },
    category: "Buyer"
  },
  {
    title: "Sold my entire wardrobe in a week",
    description: "Moving abroad and needed to downsize quickly. Listed 20+ items and they all sold within a week. The process was so smooth and the buyers were fantastic.",
    author: {
      name: "Marcus Johnson",
      image: "/api/placeholder/40/40", 
      location: "Manchester",
      rating: 5,
    },
    category: "Seller"
  },
  {
    title: "Sustainable fashion made easy",
    description: "Love that I can refresh my wardrobe without feeling guilty about fast fashion. Every purchase feels good knowing I'm giving clothes a second life.",
    author: {
      name: "Emma Rodriguez", 
      image: "/api/placeholder/40/40",
      location: "Bristol",
      rating: 5,
    },
    category: "Buyer"
  },
  {
    title: "Amazing designer finds",
    description: "I've found authentic designer pieces at incredible prices. The quality verification gives me such confidence when buying luxury items second-hand.",
    author: {
      name: "Olivia Thompson",
      image: "/api/placeholder/40/40",
      location: "Edinburgh", 
      rating: 5,
    },
    category: "Buyer"
  },
  {
    title: "Made £500 cleaning out my closet",
    description: "Started selling items I no longer wear and made enough to fund a weekend trip! It's amazing how much value was just sitting in my wardrobe.",
    author: {
      name: "James Wilson",
      image: "/api/placeholder/40/40",
      location: "Birmingham",
      rating: 5,
    },
    category: "Seller"
  },
  {
    title: "Safe and secure platform",
    description: "Was nervous about buying expensive items online, but the buyer protection and verification process made me feel completely safe. Highly recommend!",
    author: {
      name: "Sophie Miller",
      image: "/api/placeholder/40/40",
      location: "Liverpool",
      rating: 5,
    },
    category: "Buyer"
  }
];

export const Testimonials = ({ dictionary }: TestimonialsProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [api, current]);

  return (
    <section className="w-full bg-gradient-to-br from-purple-50 to-pink-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-12">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
              What Our Community Says
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Join thousands of fashion lovers who've found their perfect style on Threadly
            </p>
            
            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">4.9/5</span>
                <span className="text-gray-600">from 2,500+ reviews</span>
              </div>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={index}>
                  <div className="h-full">
                    <div className="flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <Quote className="h-8 w-8 text-purple-400" />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-4 flex-grow">
                        <div>
                          <h3 className="mb-2 font-bold text-lg text-gray-900 line-clamp-2">
                            {testimonial.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                            {testimonial.description}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.author.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      {/* Author */}
                      <div className="mt-6 flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={testimonial.author.image} alt={testimonial.author.name} />
                            <AvatarFallback>
                              {testimonial.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {testimonial.author.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {testimonial.author.location}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-full bg-purple-100 px-3 py-1">
                          <span className="text-purple-700 text-xs font-medium">
                            {testimonial.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === current % testimonials.length 
                    ? 'bg-purple-600 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  api?.scrollTo(index);
                  setCurrent(index);
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
