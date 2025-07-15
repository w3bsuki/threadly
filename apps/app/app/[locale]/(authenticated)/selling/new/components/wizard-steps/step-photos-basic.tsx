'use client';

import { Input } from '@repo/design-system/components';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { UseFormReturn } from 'react-hook-form';
import { ImageUpload } from '../image-upload';
import { Badge } from '@repo/design-system/components';
import { FileText as Template } from 'lucide-react';

interface StepPhotosBasicProps {
  form: UseFormReturn<any>;
  templates: any[];
  onTemplateSelect: (template: any) => void;
}

export function StepPhotosBasic({ form, templates, onTemplateSelect }: StepPhotosBasicProps) {
  return (
    <div className="space-y-6">
      {/* Template Selection */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Template className="h-5 w-5" />
              Quick Start Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.slice(0, 4).map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="outline"
                  className="h-auto p-3 text-left"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{template.name}</span>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Used {template.usageCount} times
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Upload */}
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Product Photos</FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                maxFiles={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Basic Information */}
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

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          📸 <strong>Photo Tips:</strong> Use natural lighting, show all angles, and include any flaws or wear. 
          First photo will be your main listing image.
        </p>
      </div>
    </div>
  );
}