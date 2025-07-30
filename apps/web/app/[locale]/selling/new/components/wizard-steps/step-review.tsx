'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import type { CreateProductInput } from '@repo/api/utils/validation/client';
import {
  DollarSign,
  Edit2,
  Image as ImageIcon,
  Package,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import type { UseFormReturn } from 'react-hook-form';

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
  SATISFACTORY: 'Satisfactory',
};

const CATEGORY_LABELS = {
  WOMEN: 'Women',
  MEN: 'Men',
  KIDS: 'Kids',
  UNISEX: 'Unisex',
  DESIGNER: 'Designer',
};

export function StepReview({ form, categories }: StepReviewProps) {
  const formData = form.getValues();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 text-center sm:space-y-2">
        <h3 className="font-semibold text-base sm:text-lg">
          Review Your Listing
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Check all details before publishing
        </p>
      </div>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Photos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {formData.images?.map((image: ProductImage, index: number) => (
              <div className="relative aspect-square" key={index}>
                <Image
                  alt={image.alt || `Product ${index + 1}`}
                  className="rounded-[var(--radius-sm)] object-cover sm:rounded-[var(--radius-md)]"
                  fill
                  sizes="(max-width: 640px) 25vw, 20vw"
                  src={image.url}
                />
                {index === 0 && (
                  <Badge className="absolute top-0.5 left-0.5 h-4 px-1 text-[10px] sm:top-1 sm:left-1 sm:h-5 sm:px-2 sm:text-xs">
                    Main
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">
              Basic Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0 sm:space-y-3 sm:p-6 sm:pt-0">
          <div>
            <h4 className="font-medium text-sm sm:text-base">
              {formData.title}
            </h4>
            <p className="font-bold text-green-600 text-lg sm:text-xl">
              ${formData.price?.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">
              Description & Category
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0 sm:p-6 sm:pt-0">
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-xs sm:text-sm">
              Category
            </p>
            <Badge className="text-xs" variant="secondary">
              {CATEGORY_LABELS[
                formData.category as keyof typeof CATEGORY_LABELS
              ] || 'Not selected'}
            </Badge>
          </div>
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-xs sm:text-sm">
              Description
            </p>
            <p className="line-clamp-3 text-xs leading-relaxed sm:line-clamp-none sm:text-sm">
              {formData.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Item Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                Condition
              </p>
              <p className="mt-0.5 text-xs sm:text-sm">
                {
                  CONDITION_LABELS[
                    formData.condition as keyof typeof CONDITION_LABELS
                  ]
                }
              </p>
            </div>
            {formData.brand && (
              <div>
                <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                  Brand
                </p>
                <p className="mt-0.5 text-xs sm:text-sm">{formData.brand}</p>
              </div>
            )}
            {formData.size && (
              <div>
                <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                  Size
                </p>
                <p className="mt-0.5 text-xs sm:text-sm">{formData.size}</p>
              </div>
            )}
            {formData.color && (
              <div>
                <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                  Color
                </p>
                <p className="mt-0.5 text-xs sm:text-sm">{formData.color}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-[var(--radius-lg)] border border-green-200 bg-green-50 p-3 sm:p-4">
        <p className="text-green-800 text-xs sm:text-sm">
          🎉 <strong>Ready to go!</strong> Your listing looks great and is ready
          to publish.
          <span className="hidden sm:inline">
            Click "Publish Listing" to make it live for buyers to see.
          </span>
        </p>
      </div>
    </div>
  );
}
