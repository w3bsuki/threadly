'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '../../../onboarding/components/step-indicator';
import { SellerProfileForm } from './seller-profile-form';
import { PaymentInfoForm } from './payment-info-form';
import { ShippingSettingsForm } from './shipping-settings-form';
import { OnboardingComplete } from './onboarding-complete';
import { Loader2 } from 'lucide-react';
import { toast } from '@repo/design-system/components';

interface SellerOnboardingWizardProps {
  userId: string;
  returnTo?: string;
  locale: string;
}

export function SellerOnboardingWizard({ userId, returnTo, locale }: SellerOnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Profile
    displayName: '',
    bio: '',
    profilePhoto: '',
    
    // Payment
    bankAccountNumber: '',
    bankRoutingNumber: '',
    accountHolderName: '',
    payoutMethod: 'bank_transfer',
    
    // Shipping
    shippingFrom: '',
    processingTime: '3',
    defaultShippingCost: '5.00',
    shippingNotes: '',
  });

  const totalSteps = 3;

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

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Save seller profile
      const response = await fetch('/api/seller/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save seller profile');
      }

      // Show completion
      toast.success('Seller profile created successfully!');
      
      // If returnTo is provided, redirect there
      if (returnTo) {
        window.location.href = returnTo;
      } else {
        // Otherwise show completion screen
        setCurrentStep(totalSteps + 1);
      }
    } catch (error) {
      toast.error('Failed to create seller profile');
      setIsSubmitting(false);
    }
  };

  if (currentStep > totalSteps) {
    return <OnboardingComplete />;
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Seller Setup</h1>
        <p className="text-muted-foreground">
          Complete your seller profile to start listing items
        </p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="mt-8">
        {currentStep === 1 && (
          <SellerProfileForm
            data={{
              displayName: formData.displayName,
              bio: formData.bio,
              profilePhoto: formData.profilePhoto,
            }}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={() => router.push('/onboarding')}
          />
        )}
        
        {currentStep === 2 && (
          <PaymentInfoForm
            data={{
              bankAccountNumber: formData.bankAccountNumber,
              bankRoutingNumber: formData.bankRoutingNumber,
              accountHolderName: formData.accountHolderName,
              payoutMethod: formData.payoutMethod,
            }}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <ShippingSettingsForm
            data={{
              shippingFrom: formData.shippingFrom,
              processingTime: formData.processingTime,
              defaultShippingCost: formData.defaultShippingCost,
              shippingNotes: formData.shippingNotes,
            }}
            onUpdate={(data) => {
              updateFormData(data);
              handleComplete();
            }}
            onNext={handleComplete}
            onBack={handleBack}
          />
        )}
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Creating your seller profile...</p>
          </div>
        </div>
      )}
    </div>
  );
}