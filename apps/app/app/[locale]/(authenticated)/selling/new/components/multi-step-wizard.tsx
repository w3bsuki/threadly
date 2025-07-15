'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { Form } from '@repo/design-system/components';
import { toast } from '@repo/design-system/components';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { createProduct, saveDraftProduct } from '../actions/create-product';
import { StepPhotosBasic } from './wizard-steps/step-photos-basic';
import { StepDescription } from './wizard-steps/step-description';
import { StepDetails } from './wizard-steps/step-details';
import { StepReview } from './wizard-steps/step-review';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0.01, 'Price must be at least $0.01').max(10000, 'Price must be less than $10,000'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface MultiStepWizardProps {
  userId: string;
  selectedTemplate?: any;
  templates: any[];
  categories: any[];
  draftProduct?: any;
}

const STEPS = [
  { id: 1, title: 'Photos & Basics', description: 'Add photos and basic information' },
  { id: 2, title: 'Description', description: 'Describe your item' },
  { id: 3, title: 'Details', description: 'Add specific details' },
  { id: 4, title: 'Review', description: 'Review and publish' },
];

export function MultiStepWizard({ 
  userId, 
  selectedTemplate, 
  templates, 
  categories,
  draftProduct 
}: MultiStepWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: draftProduct?.title || selectedTemplate?.title || '',
      description: draftProduct?.description || selectedTemplate?.description || '',
      price: draftProduct?.price ? Number(draftProduct.price) / 100 : selectedTemplate?.price || 0,
      categoryId: draftProduct?.categoryId || selectedTemplate?.categoryId || '',
      condition: draftProduct?.condition || selectedTemplate?.condition || 'GOOD',
      brand: draftProduct?.brand || selectedTemplate?.brand || '',
      size: draftProduct?.size || selectedTemplate?.size || '',
      color: draftProduct?.color || selectedTemplate?.color || '',
      images: draftProduct?.images?.map((img: any) => img.imageUrl) || selectedTemplate?.images || [],
    },
    mode: 'onChange',
  });

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (form.formState.isDirty && !isSubmitting && !isSavingDraft) {
        await saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [form.formState.isDirty, isSubmitting, isSavingDraft]);

  const saveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const formData = form.getValues();
      
      const result = await saveDraftProduct({
        ...formData,
        price: Math.round(formData.price * 100),
        sellerId: userId,
        id: draftProduct?.id,
      });

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
        isValid = await form.trigger(['description', 'categoryId']);
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

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      const result = await createProduct({
        ...data,
        price: Math.round(data.price * 100),
        sellerId: userId,
        draftId: draftProduct?.id,
      });

      if (result && result.success) {
        toast.success('Product created successfully!');
        router.push('/selling/listings');
      } else {
        if (result.details) {
          result.details.forEach((detail: any) => {
            toast.error(`${detail.path?.join('.')}: ${detail.message}`);
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
        return (
          <StepPhotosBasic 
            form={form} 
            templates={templates}
            onTemplateSelect={(template) => {
              form.reset({
                ...form.getValues(),
                ...template,
                price: template.price || 0,
              });
            }}
          />
        );
      case 2:
        return <StepDescription form={form} categories={categories} />;
      case 3:
        return <StepDetails form={form} />;
      case 4:
        return <StepReview form={form} categories={categories} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
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

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderCurrentStep()}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation */}
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