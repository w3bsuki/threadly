'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createProductSchema, type CreateProductInput } from '@repo/validation/schemas';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { Form } from '@repo/design-system/components';
import { toast } from '@repo/design-system/components';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { StepPhotosBasic } from './wizard-steps/step-photos-basic';
import { StepDescription } from './wizard-steps/step-description';
import { StepDetails } from './wizard-steps/step-details';
import { StepReview } from './wizard-steps/step-review';
import { createProduct, saveDraftProduct } from '../actions/create-product';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MultiStepWizardProps {
  categories: Category[];
  locale: string;
  userId: string;
}

const STEPS = [
  { id: 1, title: 'Photos & Basics', description: 'Add photos and basic information' },
  { id: 2, title: 'Description', description: 'Describe your item' },
  { id: 3, title: 'Details', description: 'Add specific details' },
  { id: 4, title: 'Review', description: 'Review and publish' },
];

export function MultiStepWizard({ categories, locale, userId }: MultiStepWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      currency: 'USD',
      category: 'WOMEN',
      subcategory: 'DRESSES',
      condition: 'GOOD',
      size: 'M',
      color: 'BLACK',
      brand: undefined,
      material: undefined,
      images: [],
      tags: [],
      quantity: 1,
      shippingPrice: undefined,
      isPublished: true,
    },
    mode: 'onChange',
  });

  const saveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const formData = form.getValues();
      
      const result = await saveDraftProduct(formData);

      if (result?.success) {
        toast.success('Draft saved automatically');
        form.reset(formData, { keepDirty: false });
      }
    } catch (error) {
      // Silent fail for auto-save
    } finally {
      setIsSavingDraft(false);
    }
  };

  const manualSaveDraft = async () => {
    await saveDraft();
  };

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger(['title', 'price', 'images']);
        break;
      case 2:
        isValid = await form.trigger(['description', 'category']);
        break;
      case 3:
        isValid = await form.trigger(['condition']);
        break;
      case 4:
        isValid = true;
        break;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateProductInput) => {
    try {
      setIsSubmitting(true);
      
      const result = await createProduct(data);

      if (result && result.success) {
        toast.success('Product created successfully!');
        router.push(`/${locale}/selling/listings`);
      } else {
        if (result.details) {
          result.details.forEach((detail: { path?: (string | number)[], message: string }) => {
            const path = detail.path?.map((p) => String(p)).join('.');
            toast.error(`${path}: ${detail.message}`);
          });
        } else {
          toast.error(result.error || 'Failed to create product');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPhotosBasic form={form as UseFormReturn<CreateProductInput>} />;
      case 2:
        return <StepDescription form={form as UseFormReturn<CreateProductInput>} categories={categories} />;
      case 3:
        return <StepDetails form={form as UseFormReturn<CreateProductInput>} />;
      case 4:
        return <StepReview form={form as UseFormReturn<CreateProductInput>} categories={categories} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">
            <span className="sm:hidden">Step {currentStep}/{STEPS.length}</span>
            <span className="hidden sm:inline">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={manualSaveDraft}
            disabled={isSavingDraft || !form.formState.isDirty}
            className="gap-2 w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            <span className="sm:hidden">{isSavingDraft ? 'Saving...' : 'Save'}</span>
            <span className="hidden sm:inline">{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
          </Button>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium sm:hidden">{STEPS[currentStep - 1]?.title}:</span> {STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {renderCurrentStep()}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t sm:static sm:mx-0 sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <div className="flex justify-between items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-1 sm:gap-2 min-w-[100px]"
            size="default"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="gap-1 sm:gap-2 min-w-[100px]"
                size="default"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isSubmitting}
                className="gap-2 min-w-[140px]"
                size="default"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}