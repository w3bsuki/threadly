import { Button } from '@repo/design-system/components/ui/button';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Download,
  Heart,
  Loader2,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

const meta = {
  title: 'Modern/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modern button component with 36px default touch targets following 2025 design standards. Optimized for mobile-first experiences with refined shadows and modern styling.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'brand-primary',
        'brand-gradient',
      ],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl', 'icon', 'touch', 'touch-lg'],
      description: 'Size variant (36px default for optimal touch targets)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TouchTargetVisualization: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">
          2025 Touch Target Standards
        </h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Modern touch targets optimized for mobile experiences. The 36px
          default size balances compactness with usability.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="mb-3 font-medium text-sm">Standard Sizes</h4>
          <div className="flex flex-wrap items-end gap-4">
            {[
              { size: 'xs' as const, height: '28px', label: 'XS' },
              { size: 'sm' as const, height: '32px', label: 'Small' },
              { size: 'default' as const, height: '36px', label: 'Default ✓' },
              { size: 'lg' as const, height: '40px', label: 'Large' },
              { size: 'xl' as const, height: '44px', label: 'XL' },
            ].map((item) => (
              <div className="text-center" key={item.size}>
                <Button className="relative" size={item.size}>
                  <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-primary/20" />
                  {item.label}
                </Button>
                <div className="mt-2 text-muted-foreground text-xs">
                  {item.height}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-sm">Touch-Optimized Sizes</h4>
          <div className="flex flex-wrap items-end gap-4">
            <div className="text-center">
              <Button className="relative" size="touch">
                <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-green-500/20" />
                Touch (40px min)
              </Button>
              <div className="mt-2 text-muted-foreground text-xs">
                Mobile optimized
              </div>
            </div>
            <div className="text-center">
              <Button className="relative" size="touch-lg">
                <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-blue-500/20" />
                Touch Large (44px min)
              </Button>
              <div className="mt-2 text-muted-foreground text-xs">
                Accessibility first
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-sm">Icon Buttons</h4>
          <div className="flex flex-wrap items-end gap-4">
            {[
              { size: 'icon-xs' as const, dimension: '28px' },
              { size: 'icon-sm' as const, dimension: '32px' },
              { size: 'icon' as const, dimension: '36px' },
              { size: 'icon-lg' as const, dimension: '40px' },
              { size: 'icon-xl' as const, dimension: '44px' },
            ].map((item) => (
              <div className="text-center" key={item.size}>
                <Button className="relative" size={item.size} variant="outline">
                  <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-primary/20" />
                  <Heart className="h-4 w-4" />
                </Button>
                <div className="mt-2 text-muted-foreground text-xs">
                  {item.dimension}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ModernVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Modern Button Variants</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Refined styling with subtle shadows and smooth transitions. Each
          variant is optimized for dark mode.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Primary Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="brand-primary">Brand Primary</Button>
            <Button variant="brand-gradient">Gradient</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Secondary Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Semantic Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-600/10"
              variant="outline"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Warning
            </Button>
            <Button
              className="border-green-600 text-green-600 hover:bg-green-600/10"
              variant="outline"
            >
              <Check className="mr-2 h-4 w-4" />
              Success
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Loading States</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Smooth loading transitions with proper disabled states and spinners.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
          <Button disabled variant="outline">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </Button>
          <Button disabled variant="secondary">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Real-World Examples</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Common button patterns used throughout the application.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">E-commerce Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="brand-gradient">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Save for Later
            </Button>
            <Button>
              Buy Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Mobile-First Actions</h4>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" size="touch">
              Continue Shopping
            </Button>
            <Button className="w-full sm:w-auto" size="touch" variant="outline">
              View Details
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Icon-Only Actions</h4>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Accessibility Features</h3>
        <p className="mb-6 text-muted-foreground text-sm">
          Built-in focus states, ARIA support, and keyboard navigation.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">
            Focus States (Tab through buttons)
          </h4>
          <div className="flex flex-wrap gap-3">
            <Button>Primary Focus</Button>
            <Button variant="outline">Outline Focus</Button>
            <Button variant="ghost">Ghost Focus</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Disabled States</h4>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled Primary</Button>
            <Button disabled variant="outline">
              Disabled Outline
            </Button>
            <Button disabled variant="ghost">
              Disabled Ghost
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Screen Reader Support</h4>
          <div className="flex flex-wrap gap-3">
            <Button aria-label="Add product to shopping cart">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button aria-label="Save product to favorites">
              <Heart className="h-4 w-4" />
            </Button>
            <Button aria-describedby="download-help">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-muted-foreground text-xs" id="download-help">
            Downloads the product specification sheet
          </p>
        </div>
      </div>
    </div>
  ),
};
