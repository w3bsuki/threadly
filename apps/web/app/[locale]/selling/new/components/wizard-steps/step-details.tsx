'use client';

import {
  Badge,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components';
import type { CreateProductInput } from '@repo/validation/schemas';
import type { UseFormReturn } from 'react-hook-form';

interface StepDetailsProps {
  form: UseFormReturn<CreateProductInput>;
}

const CONDITION_INFO = {
  NEW_WITH_TAGS: {
    label: 'New with tags',
    description: 'Brand new, never worn, with original tags',
    color: 'bg-green-100 text-green-800',
  },
  NEW_WITHOUT_TAGS: {
    label: 'New without tags',
    description: 'Brand new, never worn, but no tags',
    color: 'bg-green-100 text-green-800',
  },
  VERY_GOOD: {
    label: 'Very good',
    description: 'Minimal signs of wear, excellent condition',
    color: 'bg-blue-100 text-blue-800',
  },
  GOOD: {
    label: 'Good',
    description: 'Light wear, good overall condition',
    color: 'bg-yellow-100 text-yellow-800',
  },
  SATISFACTORY: {
    label: 'Satisfactory',
    description: 'Noticeable wear but still functional',
    color: 'bg-orange-100 text-orange-800',
  },
};

export function StepDetails({ form }: StepDetailsProps) {
  const selectedCondition = form.watch('condition');

  return (
    <div className="space-y-4 sm:space-y-6">
      <FormField
        control={form.control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium text-sm sm:text-base">
              Condition
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="h-12 text-base sm:h-10">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(CONDITION_INFO).map(([value, info]) => (
                  <SelectItem key={value} value={value}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCondition &&
              CONDITION_INFO[
                selectedCondition as keyof typeof CONDITION_INFO
              ] && (
                <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
                  {
                    CONDITION_INFO[
                      selectedCondition as keyof typeof CONDITION_INFO
                    ].description
                  }
                </p>
              )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm sm:text-base">
                Brand (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Nike, Zara"
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
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm sm:text-base">
                Size (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. M, 32, 8.5"
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
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm sm:text-base">
                Color (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Black, Blue"
                  {...field}
                  className="h-12 text-base sm:h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="rounded-[var(--radius-lg)] bg-muted/50 p-3 sm:p-4">
        <p className="text-muted-foreground text-xs sm:text-sm">
          ✨ <strong>Pro Tip:</strong> Accurate details help buyers find your
          item and reduce returns.
          <span className="hidden sm:inline">
            Include brand and size for better search visibility.
          </span>
        </p>
      </div>
    </div>
  );
}
