import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MultiStepWizard,
  WizardStep,
  WizardStepContainer,
  FormWizard,
  WizardFormStep,
  WizardReviewStep,
  WizardFieldGroup,
  WizardSummary,
  WizardSuccess,
  WizardCard,
  WizardInfo,
  useWizard,
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
  Card,
  CardContent,
} from '@repo/design-system/components';
import { useState } from 'react';

const meta: Meta<typeof MultiStepWizard> = {
  title: 'Modern/Wizard',
  component: MultiStepWizard,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MultiStepWizard>;

const steps: WizardStep[] = [
  {
    id: 'step-1',
    title: 'Personal Information',
    description: 'Enter your basic details',
  },
  {
    id: 'step-2',
    title: 'Contact Details',
    description: 'How can we reach you?',
  },
  {
    id: 'step-3',
    title: 'Preferences',
    description: 'Customize your experience',
    optional: true,
  },
  {
    id: 'step-4',
    title: 'Review',
    description: 'Confirm your information',
  },
];

export const BasicWizard: Story = {
  render: () => {
    const [completed, setCompleted] = useState(false);

    if (completed) {
      return (
        <WizardSuccess
          title="Registration Complete!"
          description="Thank you for signing up. You can now access all features."
        >
          <Button onClick={() => setCompleted(false)}>Start Over</Button>
        </WizardSuccess>
      );
    }

    return (
      <MultiStepWizard
        steps={steps}
        onComplete={() => setCompleted(true)}
        progressType="both"
      >
        <WizardStepContainer>
          <WizardFormStep title="Personal Information">
            <WizardFieldGroup columns={2}>
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" className="mt-1" />
              </div>
            </WizardFieldGroup>
          </WizardFormStep>

          <WizardFormStep title="Contact Details">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="john@example.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input type="tel" placeholder="+1 (555) 123-4567" className="mt-1" />
              </div>
            </div>
          </WizardFormStep>

          <WizardFormStep title="Preferences">
            <WizardInfo>
              This step is optional. You can skip it if you prefer.
            </WizardInfo>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Preferred Language</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </WizardFormStep>

          <WizardReviewStep>
            <WizardSummary
              title="Your Information"
              items={[
                { label: 'Name', value: 'John Doe' },
                { label: 'Email', value: 'john@example.com' },
                { label: 'Phone', value: '+1 (555) 123-4567' },
                { label: 'Language', value: 'English' },
              ]}
            />
          </WizardReviewStep>
        </WizardStepContainer>
      </MultiStepWizard>
    );
  },
};

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
});

type ProductFormData = z.infer<typeof productSchema>;

export const FormIntegratedWizard: Story = {
  render: () => {
    const [isComplete, setIsComplete] = useState(false);

    const form = useForm<ProductFormData>({
      resolver: zodResolver(productSchema),
      defaultValues: {
        title: '',
        description: '',
        price: 0,
        category: '',
        condition: 'GOOD',
      },
    });

    const formSteps = [
      {
        id: 'basic',
        title: 'Basic Information',
        fields: ['title', 'price'] as const,
      },
      {
        id: 'details',
        title: 'Product Details',
        fields: ['description', 'category', 'condition'] as const,
      },
      {
        id: 'review',
        title: 'Review',
      },
    ];

    if (isComplete) {
      return (
        <WizardSuccess
          title="Product Created!"
          description="Your product has been successfully listed."
        >
          <Button onClick={() => {
            setIsComplete(false);
            form.reset();
          }}>
            Create Another
          </Button>
        </WizardSuccess>
      );
    }

    return (
      <FormWizard
        form={form}
        steps={formSteps}
        onSubmit={(data) => {
          console.log('Form submitted:', data);
          setIsComplete(true);
        }}
        progressType="stepper"
      >
        <WizardFormStep title="Basic Information" stepIndex={0}>
          <WizardFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
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
        </WizardFormStep>

        <WizardFormStep title="Product Details" stepIndex={1}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product..."
                      className="min-h-24"
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="LIKE_NEW">Like New</SelectItem>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="FAIR">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </WizardFieldGroup>
          </div>
        </WizardFormStep>

        <WizardReviewStep stepIndex={2}>
          <WizardSummary
            title="Product Summary"
            items={[
              { label: 'Title', value: form.watch('title') || 'Not set' },
              { label: 'Price', value: `$${form.watch('price') || 0}` },
              { label: 'Category', value: form.watch('category') || 'Not set' },
              { label: 'Condition', value: form.watch('condition') || 'Not set' },
            ]}
          />
          <div className="mt-4">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {form.watch('description') || 'No description provided'}
            </p>
          </div>
        </WizardReviewStep>
      </FormWizard>
    );
  },
};

export const CustomNavigationWizard: Story = {
  render: () => {
    return (
      <MultiStepWizard
        steps={steps.slice(0, 3)}
        progressType="bar"
        customNavigation={
          <div className="flex justify-center gap-4">
            <CustomNavigation />
          </div>
        }
      >
        <WizardStepContainer>
          <WizardCard>
            <h3 className="text-lg font-semibold mb-4">Step 1 Content</h3>
            <p className="text-muted-foreground">
              This wizard has custom navigation controls.
            </p>
          </WizardCard>
          <WizardCard>
            <h3 className="text-lg font-semibold mb-4">Step 2 Content</h3>
            <p className="text-muted-foreground">
              You can create your own navigation component.
            </p>
          </WizardCard>
          <WizardCard>
            <h3 className="text-lg font-semibold mb-4">Step 3 Content</h3>
            <p className="text-muted-foreground">
              This gives you full control over the wizard flow.
            </p>
          </WizardCard>
        </WizardStepContainer>
      </MultiStepWizard>
    );
  },
};

function CustomNavigation() {
  const wizard = useWizard();

  return (
    <>
      {!wizard.isFirstStep && (
        <Button
          variant="outline"
          onClick={wizard.previousStep}
          disabled={wizard.isLoading}
        >
          Go Back
        </Button>
      )}
      <Button
        onClick={wizard.nextStep}
        disabled={!wizard.canGoNext || wizard.isLoading}
      >
        {wizard.isLastStep ? 'Finish' : 'Continue'}
      </Button>
    </>
  );
}

export const MobileOptimizedWizard: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => {
    return (
      <div className="min-h-screen bg-background">
        <MultiStepWizard
          steps={steps.slice(0, 3)}
          progressType="bar"
          navigationPosition="bottom"
          showStepIndicator={false}
        >
          <WizardStepContainer>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Mobile Step 1</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This wizard is optimized for mobile devices with bottom navigation.
              </p>
              <Input placeholder="Enter your name" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Mobile Step 2</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The navigation stays at the bottom for easy thumb access.
              </p>
              <Input placeholder="Enter your email" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Mobile Step 3</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Progress is shown as a simple bar to save space.
              </p>
              <Textarea placeholder="Additional comments" />
            </div>
          </WizardStepContainer>
        </MultiStepWizard>
      </div>
    );
  },
};