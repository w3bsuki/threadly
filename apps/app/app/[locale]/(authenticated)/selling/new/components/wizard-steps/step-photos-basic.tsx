'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/ui/components';
import type {
  CreateProductInput,
  SellerTemplate,
} from '@repo/api/utils/validation/schemas';
import { FileText as Template } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { ImageUpload } from '../image-upload';

interface StepPhotosBasicProps {
  form: UseFormReturn<CreateProductInput>;
  templates: SellerTemplate[];
  onTemplateSelect: (template: SellerTemplate) => void;
}

export function StepPhotosBasic({
  form,
  templates,
  onTemplateSelect,
}: StepPhotosBasicProps) {
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templates.slice(0, 4).map((template) => (
                <Button
                  className="h-auto p-3 text-left"
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
                  type="button"
                  variant="outline"
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {template.name}
                      </span>
                      {template.isDefault && (
                        <Badge className="text-xs" variant="secondary">
                          Default
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Template #{template.id.slice(0, 8)}
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
            <FormLabel className="font-medium text-base">
              Product Photos
            </FormLabel>
            <FormControl>
              <ImageUpload
                maxFiles={5}
                onChange={field.onChange}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-base">
                Item Title
              </FormLabel>
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
              <FormLabel className="font-medium text-base">Price ($)</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  {...field}
                  className="text-base"
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

      <div className="rounded-[var(--radius-lg)] bg-muted/50 p-4">
        <p className="text-muted-foreground text-sm">
          📸 <strong>Photo Tips:</strong> Use natural lighting, show all angles,
          and include any flaws or wear. First photo will be your main listing
          image.
        </p>
      </div>
    </div>
  );
}
