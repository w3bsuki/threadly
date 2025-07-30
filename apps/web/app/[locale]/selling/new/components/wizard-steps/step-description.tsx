'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/ui/components';
import type { CreateProductInput } from '@repo/api/utils/validation/client';
import type { UseFormReturn } from 'react-hook-form';

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
            <FormLabel className="font-medium text-sm sm:text-base">
              Description
            </FormLabel>
            <FormControl>
              <Textarea
                className="min-h-[120px] resize-none text-base sm:min-h-32"
                placeholder="Describe your item's condition, fit, styling tips, and any details buyers should know..."
                {...field}
                maxLength={maxChars}
              />
            </FormControl>
            <div className="flex items-center justify-between">
              <FormMessage />
              <span className="text-[10px] text-muted-foreground sm:text-xs">
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
            <FormLabel className="font-medium text-sm sm:text-base">
              Category
            </FormLabel>
            <Select defaultValue={field.value} onValueChange={field.onChange}>
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

      <div className="space-y-1.5 rounded-[var(--radius-lg)] bg-muted/50 p-3 sm:space-y-2 sm:p-4">
        <p className="font-medium text-xs sm:text-sm">💡 Writing Tips:</p>
        <ul className="space-y-0.5 text-muted-foreground text-xs sm:space-y-1 sm:text-sm">
          <li>• Mention brand, size, and condition upfront</li>
          <li>• Describe fit (runs small/large, oversized, etc.)</li>
          <li>• Note any flaws or signs of wear honestly</li>
          <li className="hidden sm:list-item">
            • Include styling suggestions or occasions
          </li>
          <li className="hidden sm:list-item">
            • Add measurements if helpful (length, bust, etc.)
          </li>
        </ul>
      </div>
    </div>
  );
}
