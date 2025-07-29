'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@repo/ui/components';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormErrorBoundary } from '@/components/error-boundaries';
import { createProduct } from '../actions/create-product';
import { CategorySelector } from './category-selector';
import { ImageUpload } from './image-upload';

const productSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  price: z
    .number()
    .min(0.01, 'Price must be at least $0.01')
    .max(10_000, 'Price must be less than $10,000'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum([
    'NEW_WITH_TAGS',
    'NEW_WITHOUT_TAGS',
    'VERY_GOOD',
    'GOOD',
    'SATISFACTORY',
  ]),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  images: z
    .array(z.string())
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  userId: string;
}

export function ProductForm({ userId }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      categoryId: '',
      condition: 'GOOD',
      brand: '',
      size: '',
      color: '',
      images: [],
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      const result = await createProduct({
        ...data,
        price: Math.round(data.price * 100), // Convert dollars to cents
        sellerId: userId,
      });

      if (result && result.success) {
        toast.success('Product created successfully!');
        router.push('/selling/listings');
      } else if (result.details) {
        // Show specific validation errors
        result.details.forEach(
          (detail: { path?: (string | number)[]; message: string }) => {
            toast.error(`${detail.path?.join('.')}: ${detail.message}`);
          }
        );
      } else {
        toast.error(result.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Vintage Denim Jacket"
                        {...field}
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
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        step="0.01"
                        type="number"
                        {...field}
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-24"
                      placeholder="Describe your item's condition, fit, and any details buyers should know..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Condition */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
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

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW_WITH_TAGS">
                          New with tags
                        </SelectItem>
                        <SelectItem value="NEW_WITHOUT_TAGS">
                          New without tags
                        </SelectItem>
                        <SelectItem value="VERY_GOOD">Very good</SelectItem>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="SATISFACTORY">
                          Satisfactory
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nike, Zara" {...field} />
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
                    <FormLabel>Size (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. M, 32, 8.5" {...field} />
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
                    <FormLabel>Color (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Black, Blue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                disabled={isSubmitting}
                onClick={() => router.back()}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Creating...' : 'List Item'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
