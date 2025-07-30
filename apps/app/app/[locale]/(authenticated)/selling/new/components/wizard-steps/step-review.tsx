'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import type { Category, CreateProductInput } from '@repo/api/utils/validation/schemas';
import {
  DollarSign,
  Edit2,
  Image as ImageIcon,
  Package,
  Palette,
  Tag,
} from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

interface StepReviewProps {
  form: UseFormReturn<CreateProductInput>;
  categories: Category[];
}

const CONDITION_LABELS = {
  NEW_WITH_TAGS: 'New with tags',
  NEW_WITHOUT_TAGS: 'New without tags',
  VERY_GOOD: 'Very good',
  GOOD: 'Good',
  SATISFACTORY: 'Satisfactory',
};

export function StepReview({ form, categories }: StepReviewProps) {
  const formData = form.getValues();
  const category = categories.find((c) => c.id === formData.categoryId);

  const goToStep = (step: number) => {
    // This would be handled by parent component
    form.trigger();
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-lg">Review Your Listing</h3>
        <p className="text-muted-foreground">
          Review all details before publishing your item
        </p>
      </div>

      {/* Images Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <CardTitle className="text-base">Photos</CardTitle>
          </div>
          <Button onClick={() => goToStep(1)} size="sm" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {formData.images?.map((image: string, index: number) => (
              <div className="relative aspect-square" key={index}>
                <img
                  alt={`Product ${index + 1}`}
                  className="h-full w-full rounded-[var(--radius-md)] object-cover"
                  src={image}
                />
                {index === 0 && (
                  <Badge className="absolute top-1 left-1 text-xs">Main</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle className="text-base">Basic Information</CardTitle>
          </div>
          <Button onClick={() => goToStep(1)} size="sm" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">{formData.title}</h4>
            <p className="font-bold text-green-600 text-xl">
              ${formData.price?.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Description & Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <CardTitle className="text-base">Description & Category</CardTitle>
          </div>
          <Button onClick={() => goToStep(2)} size="sm" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-sm">
              Category
            </p>
            <Badge variant="secondary">
              {category?.name || 'Not selected'}
            </Badge>
          </div>
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-sm">
              Description
            </p>
            <p className="text-sm leading-relaxed">{formData.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle className="text-base">Item Details</CardTitle>
          </div>
          <Button onClick={() => goToStep(3)} size="sm" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Condition
              </p>
              <p className="text-sm">
                {
                  CONDITION_LABELS[
                    formData.condition as keyof typeof CONDITION_LABELS
                  ]
                }
              </p>
            </div>
            {formData.brand && (
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Brand
                </p>
                <p className="text-sm">{formData.brand}</p>
              </div>
            )}
            {formData.size && (
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Size
                </p>
                <p className="text-sm">{formData.size}</p>
              </div>
            )}
            {formData.color && (
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Color
                </p>
                <p className="text-sm">{formData.color}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-[var(--radius-lg)] border border-green-200 bg-green-50 p-4">
        <p className="text-green-800 text-sm">
          🎉 <strong>Ready to go!</strong> Your listing looks great and is ready
          to publish. Click "Publish Listing" to make it live for buyers to see.
        </p>
      </div>
    </div>
  );
}
