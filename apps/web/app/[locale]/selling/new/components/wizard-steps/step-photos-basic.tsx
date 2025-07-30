'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/ui/components';
import type { CreateProductInput } from '@repo/api/utils/validation';
import type { UseFormReturn } from 'react-hook-form';
import { ImageUploadLazy } from '../../../../../../components/image-upload-lazy';

interface StepPhotosBasicProps {
  form: UseFormReturn<CreateProductInput>;
}

export function StepPhotosBasic({ form }: StepPhotosBasicProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium text-sm sm:text-base">
              Product Photos
            </FormLabel>
            <FormControl>
              <ImageUploadLazy
                maxFiles={5}
                onChange={field.onChange}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm sm:text-base">
                Item Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Vintage Denim Jacket"
                  {...field}
                  className="h-12 text-base sm:h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm sm:text-base">
                Price ($)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  {...field}
                  className="h-12 text-base sm:h-10"
                  inputMode="decimal"
                  onChange={(e) =>
                    field.onChange(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="rounded-[var(--radius-lg)] bg-muted/50 p-3 sm:p-4">
        <p className="text-muted-foreground text-xs sm:text-sm">
          📸 <strong>Photo Tips:</strong> Use natural lighting, show all angles,
          and include any flaws or wear. First photo will be your main listing
          image.
        </p>
      </div>
    </div>
  );
}
