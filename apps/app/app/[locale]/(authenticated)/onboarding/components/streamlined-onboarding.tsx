'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Progress } from '@repo/design-system/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { onboardingSlides } from './onboarding-slides';
import { completeOnboarding } from '../actions';
import { cn } from '@repo/design-system/lib/utils';

interface StreamlinedOnboardingProps {
  userId: string;
}

export function StreamlinedOnboarding({ userId }: StreamlinedOnboardingProps): React.JSX.Element {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'browse' | 'sell' | null>(null);

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
        window.location.href = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentSlideData = onboardingSlides[currentSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12">
              {/* Slide Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{currentSlideData.title}</h1>
                <p className="text-lg text-muted-foreground">{currentSlideData.subtitle}</p>
              </div>

              {/* Slide Content */}
              <div className="mb-8">
                {currentSlideData.content}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {currentSlide > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  
                  {currentSlide === 0 && (
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={isSubmitting}
                    >
                      Skip Tour
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Slide Indicators */}
                  <div className="flex items-center gap-1 mr-4">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentSlide 
                            ? "w-6 bg-primary" 
                            : "bg-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>

                  {!isLastSlide ? (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleComplete()}
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        'Get Started'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-friendly slide counter */}
          <div className="text-center mt-4 text-sm text-muted-foreground md:hidden">
            {currentSlide + 1} of {totalSlides}
          </div>
        </div>
      </div>
    </div>
  );
}