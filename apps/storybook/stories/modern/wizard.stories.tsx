import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormWizard,
  Input,
  MultiStepWizard,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useWizard,
  WizardCard,
  WizardFieldGroup,
  WizardFormStep,
  WizardInfo,
  WizardReviewStep,
  type WizardStep,
  WizardStepContainer,
  WizardSuccess,
  WizardSummary,
} from '@repo/ui/components';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
          description="Thank you for signing up. You can now access all features."
          title="Registration Complete!"
        >
          <Button onClick={() => setCompleted(false)}>Start Over</Button>
        </WizardSuccess>
      );
    }

    return (
      <MultiStepWizard
        onComplete={() => setCompleted(true)}
        progressType="both"
        steps={steps}
      >
        <WizardStepContainer>
          <WizardFormStep title="Personal Information">
            <WizardFieldGroup columns={2}>
              <div>
                <label className="font-medium text-sm">First Name</label>
                <Input className="mt-1" placeholder="John" />
              </div>
              <div>
                <label className="font-medium text-sm">Last Name</label>
                <Input className="mt-1" placeholder="Doe" />
              </div>
            </WizardFieldGroup>
          </WizardFormStep>

          <WizardFormStep title="Contact Details">
            <div className="space-y-4">
              <div>
                <label className="font-medium text-sm">Email</label>
                <Input
                  className="mt-1"
                  placeholder="john@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="font-medium text-sm">Phone</label>
                <Input
                  className="mt-1"
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                />
              </div>
            </div>
          </WizardFormStep>

          <WizardFormStep title="Preferences">
            <WizardInfo>
              This step is optional. You can skip it if you prefer.
            </WizardInfo>
            <div className="space-y-4">
              <div>
                <label className="font-medium text-sm">
                  Preferred Language
                </label>
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
              items={[
                { label: 'Name', value: 'John Doe' },
                { label: 'Email', value: 'john@example.com' },
                { label: 'Phone', value: '+1 (555) 123-4567' },
                { label: 'Language', value: 'English' },
              ]}
              title="Your Information"
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
          description="Your product has been successfully listed."
          title="Product Created!"
        >
          <Button
            onClick={() => {
              setIsComplete(false);
              form.reset();
            }}
          >
            Create Another
          </Button>
        </WizardSuccess>
      );
    }

    return (
      <FormWizard
        form={form}
        onSubmit={(data) => {
          console.log('Form submitted:', data);
          setIsComplete(true);
        }}
        progressType="stepper"
        steps={formSteps}
      >
        <WizardFormStep stepIndex={0} title="Basic Information">
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
        </WizardFormStep>

        <WizardFormStep stepIndex={1} title="Product Details">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-24"
                      placeholder="Describe your product..."
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
            items={[
              { label: 'Title', value: form.watch('title') || 'Not set' },
              { label: 'Price', value: `$${form.watch('price') || 0}` },
              { label: 'Category', value: form.watch('category') || 'Not set' },
              {
                label: 'Condition',
                value: form.watch('condition') || 'Not set',
              },
            ]}
            title="Product Summary"
          />
          <div className="mt-4">
            <h4 className="mb-2 font-medium">Description</h4>
            <p className="text-muted-foreground text-sm">
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
        customNavigation={
          <div className="flex justify-center gap-4">
            <CustomNavigation />
          </div>
        }
        progressType="bar"
        steps={steps.slice(0, 3)}
      >
        <WizardStepContainer>
          <WizardCard>
            <h3 className="mb-4 font-semibold text-lg">Step 1 Content</h3>
            <p className="text-muted-foreground">
              This wizard has custom navigation controls.
            </p>
          </WizardCard>
          <WizardCard>
            <h3 className="mb-4 font-semibold text-lg">Step 2 Content</h3>
            <p className="text-muted-foreground">
              You can create your own navigation component.
            </p>
          </WizardCard>
          <WizardCard>
            <h3 className="mb-4 font-semibold text-lg">Step 3 Content</h3>
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
          disabled={wizard.isLoading}
          onClick={wizard.previousStep}
          variant="outline"
        >
          Go Back
        </Button>
      )}
      <Button
        disabled={!wizard.canGoNext || wizard.isLoading}
        onClick={wizard.nextStep}
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
          navigationPosition="bottom"
          progressType="bar"
          showStepIndicator={false}
          steps={steps.slice(0, 3)}
        >
          <WizardStepContainer>
            <div className="p-4">
              <h3 className="mb-4 font-semibold text-lg">Mobile Step 1</h3>
              <p className="mb-4 text-muted-foreground text-sm">
                This wizard is optimized for mobile devices with bottom
                navigation.
              </p>
              <Input placeholder="Enter your name" />
            </div>
            <div className="p-4">
              <h3 className="mb-4 font-semibold text-lg">Mobile Step 2</h3>
              <p className="mb-4 text-muted-foreground text-sm">
                The navigation stays at the bottom for easy thumb access.
              </p>
              <Input placeholder="Enter your email" />
            </div>
            <div className="p-4">
              <h3 className="mb-4 font-semibold text-lg">Mobile Step 3</h3>
              <p className="mb-4 text-muted-foreground text-sm">
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
