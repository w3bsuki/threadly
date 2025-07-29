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
import { ValidationErrorDetail } from '@repo/validation/schemas';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createProduct, saveDraftProduct } from '../actions/create-product';
import { StepDescription } from './wizard-steps/step-description';
import { StepDetails } from './wizard-steps/step-details';
import { StepPhotosBasic } from './wizard-steps/step-photos-basic';
import { StepReview } from './wizard-steps/step-review';

const productSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  price: z
    .number()
    .min(0.01, 'Price must be at least $0.01')
    .max(10_000, 'Price must be less than $10,000'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum([
    'NEW_WITH_TAGS',
    'NEW_WITHOUT_TAGS',
    'VERY_GOOD',
    'GOOD',
    'SATISFACTORY',
  ]),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  images: z
    .array(z.string())
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  brand: string;
  size: string;
  color: string;
  images: string[];
}

interface DraftProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  brand: string;
  size: string;
  color: string;
  images: Array<{ imageUrl: string }>;
}

interface MultiStepWizardProps {
  userId: string;
  selectedTemplate?: Template;
  templates: Template[];
  categories: Category[];
  draftProduct?: DraftProduct;
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
  userId,
  selectedTemplate,
  templates,
  categories,
  draftProduct,
}: MultiStepWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: draftProduct?.title || selectedTemplate?.title || '',
      description:
        draftProduct?.description || selectedTemplate?.description || '',
      price: draftProduct?.price
        ? Number(draftProduct.price) / 100
        : selectedTemplate?.price || 0,
      categoryId:
        draftProduct?.categoryId || selectedTemplate?.categoryId || '',
      condition: (draftProduct?.condition ||
        selectedTemplate?.condition ||
        'GOOD') as
        | 'NEW_WITH_TAGS'
        | 'NEW_WITHOUT_TAGS'
        | 'VERY_GOOD'
        | 'GOOD'
        | 'SATISFACTORY'
        | undefined,
      brand: draftProduct?.brand || selectedTemplate?.brand || '',
      size: draftProduct?.size || selectedTemplate?.size || '',
      color: draftProduct?.color || selectedTemplate?.color || '',
      images:
        draftProduct?.images?.map(
          (img: { imageUrl: string }) => img.imageUrl
        ) ||
        selectedTemplate?.images ||
        [],
    },
    mode: 'onChange',
  });

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (form.formState.isDirty && !isSubmitting && !isSavingDraft) {
        await saveDraft();
      }
    }, 30_000);

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
      } else if (result.details) {
        result.details.forEach((detail) => {
          const path = detail.path?.map((p) => String(p)).join('.');
          toast.error(`${path}: ${detail.message}`);
        });
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
          <StepPhotosBasic
            form={form}
            onTemplateSelect={(template) => {
              form.reset({
                ...form.getValues(),
                ...template,
                price: template.price || 0,
              });
            }}
            templates={templates}
          />
        );
      case 2:
        return <StepDescription categories={categories} form={form} />;
      case 3:
        return <StepDetails form={form} />;
      case 4:
        return <StepReview categories={categories} form={form} />;
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
          <h2 className="font-semibold text-xl">
            Step {currentStep} of {STEPS.length}:{' '}
            {STEPS[currentStep - 1]?.title}
          </h2>
          <Button
            className="gap-2"
            disabled={isSavingDraft || !form.formState.isDirty}
            onClick={manualSaveDraft}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4" />
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>

        <div className="space-y-2">
          <Progress className="h-2" value={progress} />
          <p className="text-muted-foreground text-sm">
            {STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {renderCurrentStep()}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          className="gap-2"
          disabled={currentStep === 1}
          onClick={prevStep}
          type="button"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button className="gap-2" onClick={nextStep} type="button">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="gap-2"
              disabled={isSubmitting}
              onClick={() => form.handleSubmit(onSubmit)()}
              type="button"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
