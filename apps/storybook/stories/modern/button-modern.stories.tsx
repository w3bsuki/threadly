import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Download, Heart, ShoppingCart, Trash2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';

const meta = {
  title: 'Modern/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modern button component with 36px default touch targets following 2025 design standards. Optimized for mobile-first experiences with refined shadows and modern styling.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'brand-primary', 'brand-gradient'],
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
        <h3 className="text-lg font-semibold mb-4">2025 Touch Target Standards</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Modern touch targets optimized for mobile experiences. The 36px default size balances compactness with usability.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Standard Sizes</h4>
          <div className="flex flex-wrap gap-4 items-end">
            {[
              { size: 'xs' as const, height: '28px', label: 'XS' },
              { size: 'sm' as const, height: '32px', label: 'Small' },
              { size: 'default' as const, height: '36px', label: 'Default ✓' },
              { size: 'lg' as const, height: '40px', label: 'Large' },
              { size: 'xl' as const, height: '44px', label: 'XL' },
            ].map((item) => (
              <div key={item.size} className="text-center">
                <Button size={item.size} className="relative">
                  <span className="absolute inset-0 border-2 border-primary/20 rounded-md pointer-events-none" />
                  {item.label}
                </Button>
                <div className="text-xs text-muted-foreground mt-2">{item.height}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Touch-Optimized Sizes</h4>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="text-center">
              <Button size="touch" className="relative">
                <span className="absolute inset-0 border-2 border-green-500/20 rounded-md pointer-events-none" />
                Touch (40px min)
              </Button>
              <div className="text-xs text-muted-foreground mt-2">Mobile optimized</div>
            </div>
            <div className="text-center">
              <Button size="touch-lg" className="relative">
                <span className="absolute inset-0 border-2 border-blue-500/20 rounded-md pointer-events-none" />
                Touch Large (44px min)
              </Button>
              <div className="text-xs text-muted-foreground mt-2">Accessibility first</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Icon Buttons</h4>
          <div className="flex flex-wrap gap-4 items-end">
            {[
              { size: 'icon-xs' as const, dimension: '28px' },
              { size: 'icon-sm' as const, dimension: '32px' },
              { size: 'icon' as const, dimension: '36px' },
              { size: 'icon-lg' as const, dimension: '40px' },
              { size: 'icon-xl' as const, dimension: '44px' },
            ].map((item) => (
              <div key={item.size} className="text-center">
                <Button size={item.size} variant="outline" className="relative">
                  <span className="absolute inset-0 border-2 border-primary/20 rounded-md pointer-events-none" />
                  <Heart className="h-4 w-4" />
                </Button>
                <div className="text-xs text-muted-foreground mt-2">{item.dimension}</div>
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
        <h3 className="text-lg font-semibold mb-4">Modern Button Variants</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Refined styling with subtle shadows and smooth transitions. Each variant is optimized for dark mode.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Primary Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="brand-primary">Brand Primary</Button>
            <Button variant="brand-gradient">Gradient</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Secondary Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Semantic Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" className="text-yellow-600 border-yellow-600 hover:bg-yellow-600/10">
              <AlertCircle className="mr-2 h-4 w-4" />
              Warning
            </Button>
            <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-600/10">
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
        <h3 className="text-lg font-semibold mb-4">Loading States</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Smooth loading transitions with proper disabled states and spinners.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </Button>
          <Button variant="secondary" disabled>
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
        <h3 className="text-lg font-semibold mb-4">Real-World Examples</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Common button patterns used throughout the application.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">E-commerce Actions</h4>
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
          <h4 className="text-sm font-medium">Mobile-First Actions</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="touch" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
            <Button size="touch" variant="outline" className="w-full sm:w-auto">
              View Details
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Icon-Only Actions</h4>
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
        <h3 className="text-lg font-semibold mb-4">Accessibility Features</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Built-in focus states, ARIA support, and keyboard navigation.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Focus States (Tab through buttons)</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Primary Focus</Button>
            <Button variant="outline">Outline Focus</Button>
            <Button variant="ghost">Ghost Focus</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Disabled States</h4>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled Primary</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button variant="ghost" disabled>Disabled Ghost</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Screen Reader Support</h4>
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
          <p id="download-help" className="text-xs text-muted-foreground mt-2">
            Downloads the product specification sheet
          </p>
        </div>
      </div>
    </div>
  ),
};