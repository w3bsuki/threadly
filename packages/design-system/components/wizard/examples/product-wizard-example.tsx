'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Button,
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
  Textarea,
} from '../../';
import {
  FormWizard,
  type FormWizardStep,
  WizardFieldGroup,
  WizardFormStep,
  WizardReviewStep,
  WizardSuccess,
  WizardSummary,
} from '../index';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductWizardExample() {
  const [isComplete, setIsComplete] = React.useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      condition: 'GOOD',
      images: [],
    },
  });

  const steps: FormWizardStep<ProductFormData>[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Enter the basic details of your product',
      fields: ['title', 'price', 'images'],
    },
    {
      id: 'description',
      title: 'Description',
      description: 'Describe your product in detail',
      fields: ['description', 'category', 'subcategory'],
    },
    {
      id: 'details',
      title: 'Additional Details',
      description: 'Add specific details about your product',
      fields: ['condition', 'brand', 'size', 'color'],
      optional: true,
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your listing before publishing',
    },
  ];

  const onSubmit = async (data: ProductFormData) => {
    console.log('Submitting product:', data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <WizardSuccess
        description="Your product has been published and is now visible to buyers."
        title="Product Listed Successfully!"
      >
        <div className="flex justify-center gap-4">
          <Button onClick={() => setIsComplete(false)} variant="outline">
            List Another Product
          </Button>
          <Button>View Listing</Button>
        </div>
      </WizardSuccess>
    );
  }

  return (
    <FormWizard
      animateTransitions
      form={form}
      onSubmit={onSubmit}
      persistState
      progressType="both"
      steps={steps}
    >
      {/* Step 1: Basic Information */}
      <WizardFormStep
        description="Start by adding the essential details"
        stepIndex={0}
        title="Basic Information"
      >
        <WizardFieldGroup columns={2}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Vintage Leather Jacket"
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
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </WizardFieldGroup>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
              <FormControl>
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <p className="text-muted-foreground">
                    Image upload component would go here
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </WizardFormStep>

      {/* Step 2: Description */}
      <WizardFormStep
        description="Help buyers understand what you're selling"
        stepIndex={1}
        title="Product Description"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-32"
                  placeholder="Describe the item's condition, features, and any flaws..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <WizardFieldGroup columns={2}>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jackets, Dresses" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </WizardFieldGroup>
      </WizardFormStep>

      {/* Step 3: Additional Details */}
      <WizardFormStep
        description="Add more specific information (optional)"
        stepIndex={2}
        title="Additional Details"
      >
        <WizardFieldGroup columns={2}>
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NEW">New with tags</SelectItem>
                    <SelectItem value="LIKE_NEW">Like new</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Nike, Zara" {...field} />
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
                  <Input placeholder="e.g., M, 10, 32x34" {...field} />
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
                  <Input placeholder="e.g., Black, Blue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </WizardFieldGroup>
      </WizardFormStep>

      {/* Step 4: Review */}
      <WizardReviewStep stepIndex={3}>
        <WizardSummary
          items={[
            { label: 'Title', value: form.watch('title') || 'Not set' },
            { label: 'Price', value: `$${form.watch('price') || 0}` },
            { label: 'Category', value: form.watch('category') || 'Not set' },
            { label: 'Condition', value: form.watch('condition') || 'Not set' },
          ]}
          title="Product Details"
        />

        <div className="mt-6">
          <h4 className="mb-2 font-medium">Description</h4>
          <p className="text-muted-foreground text-sm">
            {form.watch('description') || 'No description provided'}
          </p>
        </div>
      </WizardReviewStep>
    </FormWizard>
  );
}
