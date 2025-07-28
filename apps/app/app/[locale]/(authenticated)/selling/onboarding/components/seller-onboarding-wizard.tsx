'use client';

import { toast } from '@repo/design-system/components';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StepIndicator } from '../../../onboarding/components/step-indicator';
import { OnboardingComplete } from './onboarding-complete';
import { PaymentInfoForm } from './payment-info-form';
import { SellerProfileForm } from './seller-profile-form';
import { ShippingSettingsForm } from './shipping-settings-form';

interface SellerOnboardingWizardProps {
  userId: string;
  returnTo?: string;
  locale: string;
}

export function SellerOnboardingWizard({
  userId,
  returnTo,
  locale,
}: SellerOnboardingWizardProps) {
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
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl">Seller Setup</h1>
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
            onBack={() => router.push('/onboarding')}
            onNext={handleNext}
            onUpdate={updateFormData}
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
            onBack={handleBack}
            onNext={handleNext}
            onUpdate={updateFormData}
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
            onBack={handleBack}
            onNext={handleComplete}
            onUpdate={(data) => {
              updateFormData(data);
              handleComplete();
            }}
          />
        )}
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Creating your seller profile...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
