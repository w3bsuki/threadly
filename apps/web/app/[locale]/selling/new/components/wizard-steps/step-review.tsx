'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Edit2, Image as ImageIcon, DollarSign, Tag, Package } from 'lucide-react';
import { CreateProductInput } from '@repo/validation/schemas';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StepReviewProps {
  form: UseFormReturn<CreateProductInput>;
  categories: Category[];
}

const CONDITION_LABELS = {
  NEW_WITH_TAGS: 'New with tags',
  NEW_WITHOUT_TAGS: 'New without tags',
  VERY_GOOD: 'Very good',
  GOOD: 'Good',
  SATISFACTORY: 'Satisfactory'
};

const CATEGORY_LABELS = {
  WOMEN: 'Women',
  MEN: 'Men',
  KIDS: 'Kids',
  UNISEX: 'Unisex',
  DESIGNER: 'Designer'
};

export function StepReview({ form, categories }: StepReviewProps) {
  const formData = form.getValues();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Review Your Listing</h3>
        <p className="text-muted-foreground">
          Review all details before publishing your item
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <CardTitle className="text-base">Photos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {formData.images?.map((image: any, index: number) => (
              <div key={index} className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.alt || `Product ${index + 1}`}
                  fill
                  className="object-cover rounded-[var(--radius-md)]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {index === 0 && (
                  <Badge className="absolute top-1 left-1 text-xs">Main</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle className="text-base">Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">{formData.title}</h4>
            <p className="text-xl font-bold text-green-600">${formData.price?.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <CardTitle className="text-base">Description & Category</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
            <Badge variant="secondary">
              {CATEGORY_LABELS[formData.category as keyof typeof CATEGORY_LABELS] || 'Not selected'}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm leading-relaxed">{formData.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle className="text-base">Item Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Condition</p>
              <p className="text-sm">{CONDITION_LABELS[formData.condition as keyof typeof CONDITION_LABELS]}</p>
            </div>
            {formData.brand && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brand</p>
                <p className="text-sm">{formData.brand}</p>
              </div>
            )}
            {formData.size && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Size</p>
                <p className="text-sm">{formData.size}</p>
              </div>
            )}
            {formData.color && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Color</p>
                <p className="text-sm">{formData.color}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 p-4 rounded-[var(--radius-lg)]">
        <p className="text-sm text-green-800">
          🎉 <strong>Ready to go!</strong> Your listing looks great and is ready to publish. 
          Click "Publish Listing" to make it live for buyers to see.
        </p>
      </div>
    </div>
  );
}