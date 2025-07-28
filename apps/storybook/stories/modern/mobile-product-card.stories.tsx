import {
  MobileProductCard,
  MobileProductCardSkeleton,
  MobileProductGrid,
} from '@repo/design-system/components';
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

const meta = {
  title: 'Commerce/MobileProductCard',
  component: MobileProductCard,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component:
          'Mobile-optimized product card with swipe gestures, quick actions, and 36px touch targets.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    price: {
      control: { type: 'number', step: 0.01 },
    },
    originalPrice: {
      control: { type: 'number', step: 0.01 },
    },
    inStock: {
      control: 'boolean',
    },
    isWishlisted: {
      control: 'boolean',
    },
    sizes: {
      control: 'object',
    },
  },
} satisfies Meta<typeof MobileProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base story
export const Default: Story = {
  args: {
    id: '1',
    title: 'Premium Cotton T-Shirt',
    price: 29.99,
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    inStock: true,
  },
};

// With discount
export const WithDiscount: Story = {
  args: {
    ...Default.args,
    originalPrice: 49.99,
  },
};

// With sizes
export const WithSizes: Story = {
  args: {
    ...Default.args,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
};

// With saved size (shows quick buy)
export const WithQuickBuy: Story = {
  args: {
    ...Default.args,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    savedSize: 'M',
  },
};

// Wishlisted state
export const Wishlisted: Story = {
  args: {
    ...Default.args,
    isWishlisted: true,
  },
};

// Out of stock
export const OutOfStock: Story = {
  args: {
    ...Default.args,
    inStock: false,
  },
};

// Long product name
export const LongProductName: Story = {
  args: {
    ...Default.args,
    title:
      'Premium Organic Cotton T-Shirt with Sustainable Materials and Eco-Friendly Production Process',
  },
};

// Loading skeleton
export const Loading: Story = {
  render: () => <MobileProductCardSkeleton />,
};

// Grid layout
export const GridLayout: Story = {
  render: () => {
    const products = [
      {
        id: '1',
        title: 'Cotton T-Shirt',
        price: 29.99,
        originalPrice: 49.99,
        imageUrl:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
        inStock: true,
        sizes: ['S', 'M', 'L'],
        savedSize: 'M',
      },
      {
        id: '2',
        title: 'Denim Jacket',
        price: 89.99,
        imageUrl:
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
        inStock: true,
        isWishlisted: true,
      },
      {
        id: '3',
        title: 'Linen Dress',
        price: 149.99,
        imageUrl:
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
        inStock: false,
      },
      {
        id: '4',
        title: 'Wool Sweater',
        price: 79.99,
        originalPrice: 99.99,
        imageUrl:
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
        inStock: true,
      },
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-3">
        <MobileProductGrid products={products} />
      </div>
    );
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  render: () => {
    const [isWishlisted, setIsWishlisted] = React.useState(false);
    const [addedItems, setAddedItems] = React.useState<string[]>([]);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mb-4 rounded-lg bg-white p-3 shadow-sm">
          <h3 className="mb-2 font-semibold">Interactive Features:</h3>
          <ul className="space-y-1 text-gray-600 text-sm">
            <li>• Swipe left/right for wishlist</li>
            <li>• Long press image for sizes</li>
            <li>• Click heart to toggle wishlist</li>
            <li>• Add to cart with size selection</li>
          </ul>
          {addedItems.length > 0 && (
            <div className="mt-3 rounded bg-green-100 p-2">
              <p className="text-green-800 text-sm">
                Added to cart: {addedItems.join(', ')}
              </p>
            </div>
          )}
        </div>

        <MobileProductCard
          id="demo-1"
          imageUrl="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop"
          inStock={true}
          isWishlisted={isWishlisted}
          onAddToCart={(id, size) => {
            setAddedItems([...addedItems, `${id} (${size})`]);
          }}
          onQuickBuy={(id, size) => {
            alert(`Quick buy: ${id} - Size ${size}`);
          }}
          onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
          originalPrice={79.99}
          price={59.99}
          savedSize="M"
          sizes={['XS', 'S', 'M', 'L', 'XL']}
          title="Interactive Demo Product"
        />
      </div>
    );
  },
};

// Performance test with many cards
export const PerformanceTest: Story = {
  render: () => {
    const products = Array.from({ length: 20 }, (_, i) => ({
      id: `perf-${i}`,
      title: `Product ${i + 1}`,
      price: 29.99 + i * 10,
      imageUrl: `https://picsum.photos/400/500?random=${i}`,
      inStock: i % 3 !== 0,
      sizes: ['S', 'M', 'L'],
      isWishlisted: i % 4 === 0,
    }));

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="grid grid-cols-2 gap-3 p-3">
          {products.map((product) => (
            <MobileProductCard
              key={product.id}
              {...product}
              onAddToCart={() => {}}
              onToggleWishlist={() => {}}
            />
          ))}
        </div>
      </div>
    );
  },
};
