'use client';

import { Input } from '@repo/design-system/components';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { UseFormReturn } from 'react-hook-form';
import { ImageUploadLazy } from '../../../../../../components/image-upload-lazy';
import { CreateProductInput } from '@repo/validation/schemas';

interface StepPhotosBasicProps {
  form: UseFormReturn<CreateProductInput>;
}

export function StepPhotosBasic({ form }: StepPhotosBasicProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Product Photos</FormLabel>
            <FormControl>
              <ImageUploadLazy
                value={field.value}
                onChange={field.onChange}
                maxFiles={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Item Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Vintage Denim Jacket" 
                  {...field}
                  className="text-base"
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
              <FormLabel className="text-base font-medium">Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-[var(--radius-lg)]">
        <p className="text-sm text-muted-foreground">
          📸 <strong>Photo Tips:</strong> Use natural lighting, show all angles, and include any flaws or wear. 
          First photo will be your main listing image.
        </p>
      </div>
    </div>
  );
}