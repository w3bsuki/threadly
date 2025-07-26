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

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2">
        <h3 className="text-base sm:text-lg font-semibold">Review Your Listing</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Check all details before publishing
        </p>
      </div>

      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Photos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {formData.images?.map((image: ProductImage, index: number) => (
              <div key={index} className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.alt || `Product ${index + 1}`}
                  fill
                  className="object-cover rounded-[var(--radius-sm)] sm:rounded-[var(--radius-md)]"
                  sizes="(max-width: 640px) 25vw, 20vw"
                />
                {index === 0 && (
                  <Badge className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-2">Main</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
          <div>
            <h4 className="font-medium text-sm sm:text-base">{formData.title}</h4>
            <p className="text-lg sm:text-xl font-bold text-green-600">${formData.price?.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Description & Category</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Category</p>
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[formData.category as keyof typeof CATEGORY_LABELS] || 'Not selected'}
            </Badge>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">{formData.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Item Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Condition</p>
              <p className="text-xs sm:text-sm mt-0.5">{CONDITION_LABELS[formData.condition as keyof typeof CONDITION_LABELS]}</p>
            </div>
            {formData.brand && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Brand</p>
                <p className="text-xs sm:text-sm mt-0.5">{formData.brand}</p>
              </div>
            )}
            {formData.size && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Size</p>
                <p className="text-xs sm:text-sm mt-0.5">{formData.size}</p>
              </div>
            )}
            {formData.color && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Color</p>
                <p className="text-xs sm:text-sm mt-0.5">{formData.color}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-[var(--radius-lg)]">
        <p className="text-xs sm:text-sm text-green-800">
          🎉 <strong>Ready to go!</strong> Your listing looks great and is ready to publish. 
          <span className="hidden sm:inline">Click "Publish Listing" to make it live for buyers to see.</span>
        </p>
      </div>
    </div>
  );
}