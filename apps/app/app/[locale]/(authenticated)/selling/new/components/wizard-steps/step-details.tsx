'use client';

import { Input } from '@repo/design-system/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { UseFormReturn } from 'react-hook-form';
import { Badge } from '@repo/design-system/components';

interface StepDetailsProps {
  form: UseFormReturn<any>;
}

const CONDITION_INFO = {
  NEW_WITH_TAGS: {
    label: 'New with tags',
    description: 'Brand new, never worn, with original tags',
    color: 'bg-green-100 text-green-800'
  },
  NEW_WITHOUT_TAGS: {
    label: 'New without tags',
    description: 'Brand new, never worn, but no tags',
    color: 'bg-green-100 text-green-800'
  },
  VERY_GOOD: {
    label: 'Very good',
    description: 'Minimal signs of wear, excellent condition',
    color: 'bg-blue-100 text-blue-800'
  },
  GOOD: {
    label: 'Good',
    description: 'Light wear, good overall condition',
    color: 'bg-yellow-100 text-yellow-800'
  },
  SATISFACTORY: {
    label: 'Satisfactory',
    description: 'Noticeable wear but still functional',
    color: 'bg-orange-100 text-orange-800'
  }
};

export function StepDetails({ form }: StepDetailsProps) {
  const selectedCondition = form.watch('condition');

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Condition</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(CONDITION_INFO).map(([value, info]) => (
                  <SelectItem key={value} value={value} className="flex flex-col items-start">
                    <div className="flex items-center gap-2 w-full">
                      <span>{info.label}</span>
                      <Badge className={`text-xs ${info.color}`}>
                        {info.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCondition && CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO] && (
              <p className="text-sm text-muted-foreground">
                {CONDITION_INFO[selectedCondition as keyof typeof CONDITION_INFO].description}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Brand (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Nike, Zara" 
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
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Size (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. M, 32, 8.5" 
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
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Color (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Black, Blue" 
                  {...field} 
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
          ✨ <strong>Pro Tip:</strong> Accurate details help buyers find your item and reduce returns. 
          Include brand and size for better search visibility.
        </p>
      </div>
    </div>
  );
}