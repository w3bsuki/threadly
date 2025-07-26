'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormWizard,
  FormWizardStep,
  WizardFormStep,
  WizardReviewStep,
  WizardFieldGroup,
  WizardSummary,
  WizardSuccess,
} from '../index';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '../../';

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
        title="Product Listed Successfully!"
        description="Your product has been published and is now visible to buyers."
      >
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setIsComplete(false)}>
            List Another Product
          </Button>
          <Button>View Listing</Button>
        </div>
      </WizardSuccess>
    );
  }

  return (
    <FormWizard
      form={form}
      steps={steps}
      onSubmit={onSubmit}
      progressType="both"
      animateTransitions
      persistState
    >
      {/* Step 1: Basic Information */}
      <WizardFormStep
        title="Basic Information"
        description="Start by adding the essential details"
        stepIndex={0}
      >
        <WizardFieldGroup columns={2}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Vintage Leather Jacket" {...field} />
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
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
        title="Product Description"
        description="Help buyers understand what you're selling"
        stepIndex={1}
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the item's condition, features, and any flaws..."
                  className="min-h-32"
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
        title="Additional Details"
        description="Add more specific information (optional)"
        stepIndex={2}
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
          title="Product Details"
          items={[
            { label: 'Title', value: form.watch('title') || 'Not set' },
            { label: 'Price', value: `$${form.watch('price') || 0}` },
            { label: 'Category', value: form.watch('category') || 'Not set' },
            { label: 'Condition', value: form.watch('condition') || 'Not set' },
          ]}
        />

        <div className="mt-6">
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">
            {form.watch('description') || 'No description provided'}
          </p>
        </div>
      </WizardReviewStep>
    </FormWizard>
  );
}