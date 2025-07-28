'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserPreferenceRole } from '@/lib/database-types';
import { saveUserPreferences } from '../actions';
import { BrandsSelection } from './brands-selection';
import { HowItWorks } from './how-it-works';
import { InterestsSelection } from './interests-selection';
import { LocationSelection } from './location-selection';
import { RoleSelection } from './role-selection';
import { StepIndicator } from './step-indicator';

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({
  userId,
}: OnboardingWizardProps): React.JSX.Element {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    preferredRole: 'BUYER' as UserPreferenceRole,
    interests: [] as string[],
    favoriteBrands: [] as string[],
    location: '',
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await saveUserPreferences(userId, {
        ...formData,
        onboardingCompleted: true,
      });

      if (
        formData.preferredRole === 'SELLER' ||
        formData.preferredRole === 'BOTH'
      ) {
        router.push('/selling/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await saveUserPreferences(userId, {
        preferredRole: 'BUYER',
        interests: [],
        favoriteBrands: [],
        location: '',
        onboardingCompleted: true,
      });
      router.push('/dashboard');
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl">Welcome to Threadly!</h1>
        <p className="text-muted-foreground">
          Let's personalize your experience in just a few steps
        </p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <RoleSelection
                onSelect={(role) => updateFormData({ preferredRole: role })}
                selectedRole={formData.preferredRole}
              />
            )}

            {currentStep === 2 && (
              <InterestsSelection
                onSelect={(interests) => updateFormData({ interests })}
                selectedInterests={formData.interests}
              />
            )}

            {currentStep === 3 && (
              <BrandsSelection
                onSelect={(brands) =>
                  updateFormData({ favoriteBrands: brands })
                }
                selectedBrands={formData.favoriteBrands}
              />
            )}

            {currentStep === 4 && (
              <LocationSelection
                location={formData.location}
                onSelect={(location) => updateFormData({ location })}
              />
            )}

            {currentStep === 5 && (
              <HowItWorks selectedRole={formData.preferredRole} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button
              disabled={isSubmitting}
              onClick={handleBack}
              variant="outline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}

          <Button disabled={isSubmitting} onClick={handleSkip} variant="ghost">
            Skip for now
          </Button>
        </div>

        <div>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button disabled={isSubmitting} onClick={handleComplete}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
