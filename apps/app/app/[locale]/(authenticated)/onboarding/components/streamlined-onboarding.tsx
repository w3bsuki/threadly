'use client';

import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { Progress } from '@repo/ui/components/ui/progress';
import { cn } from '@repo/ui/lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { completeOnboarding } from '../actions';
import { onboardingSlides } from './onboarding-slides';

interface StreamlinedOnboardingProps {
  userId: string;
}

export function StreamlinedOnboarding({
  userId,
}: StreamlinedOnboardingProps): React.JSX.Element {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'browse' | 'sell' | null>(
    null
  );

  const totalSlides = onboardingSlides.length;
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  const isLastSlide = currentSlide === totalSlides - 1;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async (path?: 'browse' | 'sell') => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(userId);

      // Navigate based on user choice or default to dashboard
      if (path === 'sell') {
        router.push('/selling/new');
      } else if (path === 'browse') {
        // Redirect to main marketplace
        window.location.href =
          process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentSlideData = onboardingSlides[currentSlide];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress Bar */}
      <div className="w-full px-4 pt-8">
        <div className="mx-auto max-w-2xl">
          <Progress className="h-2" value={progress} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12">
              {/* Slide Header */}
              <div className="mb-8 text-center">
                <h1 className="mb-2 font-bold text-3xl">
                  {currentSlideData.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {currentSlideData.subtitle}
                </p>
              </div>

              {/* Slide Content */}
              <div className="mb-8">{currentSlideData.content}</div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {currentSlide > 0 && (
                    <Button
                      disabled={isSubmitting}
                      onClick={handleBack}
                      variant="outline"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                  )}

                  {currentSlide === 0 && (
                    <Button
                      disabled={isSubmitting}
                      onClick={handleSkip}
                      variant="ghost"
                    >
                      Skip Tour
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Slide Indicators */}
                  <div className="mr-4 flex items-center gap-1">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <div
                        className={cn(
                          'h-2 w-2 rounded-[var(--radius-full)] transition-all',
                          index === currentSlide
                            ? 'w-6 bg-primary'
                            : 'bg-muted-foreground/30'
                        )}
                        key={index}
                      />
                    ))}
                  </div>

                  {isLastSlide ? (
                    <Button
                      className="min-w-[120px]"
                      disabled={isSubmitting}
                      onClick={() => handleComplete()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        'Get Started'
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-friendly slide counter */}
          <div className="mt-4 text-center text-muted-foreground text-sm md:hidden">
            {currentSlide + 1} of {totalSlides}
          </div>
        </div>
      </div>
    </div>
  );
}
