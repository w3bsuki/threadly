'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { updateProduct, deleteProduct } from '../actions/product-actions';
import { ImageUpload } from '../../../../new/components/image-upload';

const editProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0.01, 'Price must be at least $0.01').max(10000, 'Price must be less than $10,000'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'REMOVED']),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  condition: string;
  brand?: string;
  size?: string;
  color?: string;
  status: string;
  images: Array<{
    id: string;
    url: string;
    altText?: string;
    displayOrder: number;
  }>;
  category: {
    id: number;
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
      condition: product.condition as any,
      brand: product.brand || '',
      size: product.size || '',
      color: product.color || '',
      status: product.status as any,
      images: product.images.map(img => img.url),
    },
  });

  const onSubmit = async (data: EditProductFormData) => {
    try {
      setIsSubmitting(true);
      
      const result = await updateProduct(product.id, {
        ...data,
        sellerId: userId,
      });

      if (result.success) {
        router.push('/selling/listings');
      } else {
        console.error('Failed to update product:', result.error);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const result = await deleteProduct(product.id);

      if (result.success) {
        router.push('/selling/listings');
      } else {
        console.error('Failed to delete product:', result.error);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
              variant={currentStatus === 'AVAILABLE' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={toggleStatus}
            >
              {currentStatus === 'AVAILABLE' ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vintage Denim Jacket" {...field} />
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
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                      placeholder="Describe your item's condition, fit, and any details buyers should know..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Women's Clothing</SelectItem>
                        <SelectItem value="2">Men's Clothing</SelectItem>
                        <SelectItem value="3">Kids' Clothing</SelectItem>
                        <SelectItem value="4">Shoes</SelectItem>
                        <SelectItem value="5">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW_WITH_TAGS">New with tags</SelectItem>
                        <SelectItem value="NEW_WITHOUT_TAGS">New without tags</SelectItem>
                        <SelectItem value="VERY_GOOD">Very good</SelectItem>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="SATISFACTORY">Satisfactory</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available - Visible to buyers</SelectItem>
                      <SelectItem value="REMOVED">Removed - Hidden from buyers</SelectItem>
                      <SelectItem value="SOLD">Sold - Mark as sold</SelectItem>
                      <SelectItem value="RESERVED">Reserved - On hold for buyer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
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