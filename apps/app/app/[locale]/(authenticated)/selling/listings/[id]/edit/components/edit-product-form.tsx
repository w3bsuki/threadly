'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
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
} from '@repo/design-system/components';
import { Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CategorySelector } from '../../../../new/components/category-selector';
import { ImageUpload } from '../../../../new/components/image-upload';
import { deleteProduct, updateProduct } from '../actions/product-actions';

const editProductSchema = z.object({
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
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'REMOVED']),
  images: z
    .array(z.string())
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  brand?: string | null;
  size?: string | null;
  color?: string | null;
  status: string;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string | null;
    displayOrder: number;
  }>;
  category: {
    id: string;
    name: string;
  };
}

interface EditProductFormProps {
  product: Product;
  userId: string;
}

export function EditProductForm({ product, userId }: EditProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      title: product.title,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId.toString(),
      condition: product.condition as
        | 'NEW_WITH_TAGS'
        | 'NEW_WITHOUT_TAGS'
        | 'VERY_GOOD'
        | 'GOOD'
        | 'SATISFACTORY',
      brand: product.brand || '',
      size: product.size || '',
      color: product.color || '',
      status: product.status as 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'REMOVED',
      images: product.images.map((img) => img.imageUrl),
    },
  });

  const onSubmit = async (data: EditProductFormData) => {
    try {
      setIsSubmitting(true);

      const result = await updateProduct(product.id, {
        ...data,
        price: Math.round(data.price * 100), // Convert dollars to cents
        sellerId: userId,
      });

      if (result.success) {
        router.push('/selling/listings');
      } else {
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      const result = await deleteProduct(product.id);

      if (result.success) {
        router.push('/selling/listings');
      } else {
      }
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = () => {
    const currentStatus = form.getValues('status');
    const newStatus = currentStatus === 'AVAILABLE' ? 'REMOVED' : 'AVAILABLE';
    form.setValue('status', newStatus);
  };

  const currentStatus = form.watch('status');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Product Details</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              className="cursor-pointer"
              onClick={toggleStatus}
              variant={currentStatus === 'AVAILABLE' ? 'default' : 'secondary'}
            >
              {currentStatus === 'AVAILABLE' ? (
                <>
                  <Eye className="mr-1 h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </div>
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
                      defaultValue={field.value}
                      onValueChange={field.onChange}
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

            {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Status</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">
                        Available - Visible to buyers
                      </SelectItem>
                      <SelectItem value="REMOVED">
                        Removed - Hidden from buyers
                      </SelectItem>
                      <SelectItem value="SOLD">Sold - Mark as sold</SelectItem>
                      <SelectItem value="RESERVED">
                        Reserved - On hold for buyer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                disabled={isDeleting || isSubmitting}
                onClick={handleDelete}
                type="button"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </Button>

              <div className="flex gap-2">
                <Button
                  disabled={isSubmitting}
                  onClick={() => router.back()}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
