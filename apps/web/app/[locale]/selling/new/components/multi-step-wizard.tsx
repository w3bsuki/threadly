'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  Progress,
  toast,
} from '@repo/ui/components';
import {
  type CreateProductInput,
  createProductSchema,
} from '@repo/api/utils/validation/client';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { createProduct, saveDraftProduct } from '../actions/create-product';
import { StepDescription } from './wizard-steps/step-description';
import { StepDetails } from './wizard-steps/step-details';
import { StepPhotosBasic } from './wizard-steps/step-photos-basic';
import { StepReview } from './wizard-steps/step-review';

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
  {
    id: 1,
    title: 'Photos & Basics',
    description: 'Add photos and basic information',
  },
  { id: 2, title: 'Description', description: 'Describe your item' },
  { id: 3, title: 'Details', description: 'Add specific details' },
  { id: 4, title: 'Review', description: 'Review and publish' },
];

export function MultiStepWizard({
  categories,
  locale,
  userId,
}: MultiStepWizardProps) {
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
      } else if (result.details) {
        result.details.forEach(
          (detail: { path?: (string | number)[]; message: string }) => {
            const path = detail.path?.map((p) => String(p)).join('.');
            toast.error(`${path}: ${detail.message}`);
          }
        );
      } else {
        toast.error(result.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPhotosBasic form={form as UseFormReturn<CreateProductInput>} />
        );
      case 2:
        return (
          <StepDescription
            categories={categories}
            form={form as UseFormReturn<CreateProductInput>}
          />
        );
      case 3:
        return <StepDetails form={form as UseFormReturn<CreateProductInput>} />;
      case 4:
        return (
          <StepReview
            categories={categories}
            form={form as UseFormReturn<CreateProductInput>}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-lg sm:text-xl">
            <span className="sm:hidden">
              Step {currentStep}/{STEPS.length}
            </span>
            <span className="hidden sm:inline">
              Step {currentStep} of {STEPS.length}:{' '}
              {STEPS[currentStep - 1]?.title}
            </span>
          </h2>
          <Button
            className="w-full gap-2 sm:w-auto"
            disabled={isSavingDraft || !form.formState.isDirty}
            onClick={manualSaveDraft}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4" />
            <span className="sm:hidden">
              {isSavingDraft ? 'Saving...' : 'Save'}
            </span>
            <span className="hidden sm:inline">
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </span>
          </Button>
        </div>

        <div className="space-y-2">
          <Progress className="h-2" value={progress} />
          <p className="text-muted-foreground text-xs sm:text-sm">
            <span className="font-medium sm:hidden">
              {STEPS[currentStep - 1]?.title}:
            </span>{' '}
            {STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {renderCurrentStep()}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="-mx-4 sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="flex items-center justify-between gap-3">
          <Button
            className="min-w-[100px] gap-1 sm:gap-2"
            disabled={currentStep === 1}
            onClick={prevStep}
            size="default"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button
                className="min-w-[100px] gap-1 sm:gap-2"
                onClick={nextStep}
                size="default"
                type="button"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="min-w-[140px] gap-2"
                disabled={isSubmitting}
                onClick={() => form.handleSubmit(onSubmit)()}
                size="default"
                type="button"
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
