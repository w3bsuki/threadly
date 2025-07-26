'use client';

import { Textarea } from '@repo/design-system/components';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { UseFormReturn } from 'react-hook-form';
import { CategorySelector } from '../category-selector';
import type { CreateProductInput } from '@repo/validation/schemas';
import type { Category } from '@repo/validation/schemas';

interface StepDescriptionProps {
  form: UseFormReturn<CreateProductInput>;
  categories: Category[];
}

export function StepDescription({ form, categories }: StepDescriptionProps) {
  const description = form.watch('description');
  const charCount = description?.length || 0;
  const maxChars = 1000;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your item's condition, fit, styling tips, and any details buyers should know..."
                className="min-h-32 text-base resize-none"
                {...field}
                maxLength={maxChars}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage />
              <span className="text-xs text-muted-foreground">
                {charCount}/{maxChars} characters
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Category</FormLabel>
            <FormControl>
              <CategorySelector
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select a category"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-muted/50 p-4 rounded-[var(--radius-lg)] space-y-2">
        <p className="text-sm font-medium">💡 Writing Tips:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Mention brand, size, and condition upfront</li>
          <li>• Describe fit (runs small/large, oversized, etc.)</li>
          <li>• Note any flaws or signs of wear honestly</li>
          <li>• Include styling suggestions or occasions</li>
          <li>• Add measurements if helpful (length, bust, etc.)</li>
        </ul>
      </div>
    </div>
  );
}