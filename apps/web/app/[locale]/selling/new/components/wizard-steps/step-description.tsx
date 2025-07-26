'use client';

import { Textarea } from '@repo/design-system/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { UseFormReturn } from 'react-hook-form';
import { CreateProductInput } from '@repo/validation/schemas';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StepDescriptionProps {
  form: UseFormReturn<CreateProductInput>;
  categories: Category[];
}

export function StepDescription({ form, categories }: StepDescriptionProps) {
  const description = form.watch('description');
  const charCount = description?.length || 0;
  const maxChars = 2000;

  return (
    <div className="space-y-4 sm:space-y-6">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base font-medium">Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your item's condition, fit, styling tips, and any details buyers should know..."
                className="min-h-[120px] sm:min-h-32 text-base resize-none"
                {...field}
                maxLength={maxChars}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage />
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {charCount}/{maxChars}
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base font-medium">Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 sm:h-10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="WOMEN">Women</SelectItem>
                <SelectItem value="MEN">Men</SelectItem>
                <SelectItem value="KIDS">Kids</SelectItem>
                <SelectItem value="UNISEX">Unisex</SelectItem>
                <SelectItem value="DESIGNER">Designer</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-muted/50 p-3 sm:p-4 rounded-[var(--radius-lg)] space-y-1.5 sm:space-y-2">
        <p className="text-xs sm:text-sm font-medium">💡 Writing Tips:</p>
        <ul className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
          <li>• Mention brand, size, and condition upfront</li>
          <li>• Describe fit (runs small/large, oversized, etc.)</li>
          <li>• Note any flaws or signs of wear honestly</li>
          <li className="hidden sm:list-item">• Include styling suggestions or occasions</li>
          <li className="hidden sm:list-item">• Add measurements if helpful (length, bust, etc.)</li>
        </ul>
      </div>
    </div>
  );
}