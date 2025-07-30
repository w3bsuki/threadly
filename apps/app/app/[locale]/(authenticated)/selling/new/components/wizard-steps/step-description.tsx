'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@repo/ui/components';
import type { Category, CreateProductInput } from '@repo/api/utils/validation/schemas';
import type { UseFormReturn } from 'react-hook-form';
import { CategorySelector } from '../category-selector';

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
            <FormLabel className="font-medium text-base">Description</FormLabel>
            <FormControl>
              <Textarea
                className="min-h-32 resize-none text-base"
                placeholder="Describe your item's condition, fit, styling tips, and any details buyers should know..."
                {...field}
                maxLength={maxChars}
              />
            </FormControl>
            <div className="flex items-center justify-between">
              <FormMessage />
              <span className="text-muted-foreground text-xs">
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
            <FormLabel className="font-medium text-base">Category</FormLabel>
            <FormControl>
              <CategorySelector
                onValueChange={field.onChange}
                placeholder="Select a category"
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2 rounded-[var(--radius-lg)] bg-muted/50 p-4">
        <p className="font-medium text-sm">💡 Writing Tips:</p>
        <ul className="space-y-1 text-muted-foreground text-sm">
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
