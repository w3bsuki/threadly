'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { StepIndicator } from './step-indicator';
import { RoleSelection } from './role-selection';
import { InterestsSelection } from './interests-selection';
import { BrandsSelection } from './brands-selection';
import { LocationSelection } from './location-selection';
import { HowItWorks } from './how-it-works';
import { saveUserPreferences } from '../actions';
import type { UserPreferenceRole } from '@/lib/database-types';

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps): React.JSX.Element {
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
      
      if (formData.preferredRole === 'SELLER' || formData.preferredRole === 'BOTH') {
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
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Threadly!</h1>
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
                selectedRole={formData.preferredRole}
                onSelect={(role) => updateFormData({ preferredRole: role })}
              />
            )}
            
            {currentStep === 2 && (
              <InterestsSelection
                selectedInterests={formData.interests}
                onSelect={(interests) => updateFormData({ interests })}
              />
            )}
            
            {currentStep === 3 && (
              <BrandsSelection
                selectedBrands={formData.favoriteBrands}
                onSelect={(brands) => updateFormData({ favoriteBrands: brands })}
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

      <div className="flex justify-between mt-8">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip for now
          </Button>
        </div>

        <div>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}