'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createProductSchema, type CreateProductInput } from '@repo/validation/schemas';
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

  const form = useForm({
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
      
      const result = await saveDraftProduct(formData as any);

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

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const result = await createProduct(data as any);

      if (result && result.success) {
        toast.success('Product created successfully!');
        router.push(`/${locale}/selling/listings`);
      } else {
        if (result.details) {
          result.details.forEach((detail: any) => {
            const path = detail.path?.map((p: any) => String(p)).join('.');
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
        return <StepPhotosBasic form={form as any} />;
      case 2:
        return <StepDescription form={form as any} categories={categories} />;
      case 3:
        return <StepDetails form={form as any} />;
      case 4:
        return <StepReview form={form as any} categories={categories} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={manualSaveDraft}
            disabled={isSavingDraft || !form.formState.isDirty}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderCurrentStep()}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}