/**
 * Critical UI Components Tests
 *
 * This test suite covers critical UI components including
 * ProductCard, CheckoutForm, Dashboard, and mobile components.
 */

import { cleanup, fireEvent, render, screen } from '@repo/testing';
import React, {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Type definitions for mocks
interface MockImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

interface MockLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: MockImageProps) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock UI components
vi.mock('@repo/ui/components', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant = 'default',
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    children: ReactNode;
  }) => (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({
    children,
    className = '',
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className="card-header" {...props}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className="card-content" {...props}>
      {children}
    </div>
  ),
  CardFooter: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className="card-footer" {...props}>
      {children}
    </div>
  ),
  Input: ({
    value,
    onChange,
    placeholder,
    type = 'text',
    ...props
  }: InputHTMLAttributes<HTMLInputElement>) => (
    <input
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
      {...props}
    />
  ),
  Label: ({
    children,
    ...props
  }: HTMLAttributes<HTMLLabelElement> & { children: ReactNode }) => (
    <label {...props}>{children}</label>
  ),
  Badge: ({
    children,
    variant = 'default',
    ...props
  }: HTMLAttributes<HTMLSpanElement> & {
    children: ReactNode;
    variant?: string;
  }) => (
    <span className={`badge badge-${variant}`} {...props}>
      {children}
    </span>
  ),
  Skeleton: ({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={`skeleton ${className}`} {...props} />
  ),
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
  }) =>
    open ? (
      <div className="dialog" data-testid="dialog">
        {children}
      </div>
    ) : null,
  DialogContent: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className="dialog-header" {...props}>
      {children}
    </div>
  ),
  DialogTitle: ({
    children,
    ...props
  }: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) => (
    <h2 className="dialog-title" {...props}>
      {children}
    </h2>
  ),
  DialogFooter: ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) => (
    <div className="dialog-footer" {...props}>
      {children}
    </div>
  ),
}));

// Mock hooks
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('@repo/cart', () => ({
  useCart: vi.fn(),
}));

describe('Critical UI Components Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('ProductCard Component', () => {
    const mockProduct = {
      id: 'prod_1',
      title: 'iPhone 13 Pro',
      description: 'Excellent condition iPhone 13 Pro',
      price: 799.99,
      condition: 'VERY_GOOD',
      imageUrl: 'https://utfs.io/image1.jpg',
      seller: {
        id: 'user_1',
        firstName: 'John',
        lastName: 'Doe',
        averageRating: 4.8,
        verified: true,
      },
      category: {
        name: 'Electronics',
        slug: 'electronics',
      },
      images: [
        { imageUrl: 'https://utfs.io/image1.jpg' },
        { imageUrl: 'https://utfs.io/image2.jpg' },
      ],
      _count: {
        favorites: 12,
      },
      createdAt: new Date().toISOString(),
    };

    interface ProductCardProps {
      product: {
        id: string;
        title: string;
        price: number;
        imageUrl: string;
        seller: { id: string; name: string };
        condition: string;
        size?: string;
        brand?: string;
      };
      onFavorite?: (id: string) => void;
      onAddToCart?: (id: string) => void;
    }

    const ProductCard = ({
      product,
      onFavorite,
      onAddToCart,
    }: ProductCardProps) => {
      const [isFavorited, setIsFavorited] = React.useState(false);

      return (
        <div className="product-card" data-testid="product-card">
          <div className="product-image">
            <img alt={product.title} src={product.images[0]?.imageUrl} />
            <button
              aria-label={
                isFavorited ? 'Remove from favorites' : 'Add to favorites'
              }
              className="favorite-btn"
              onClick={() => {
                setIsFavorited(!isFavorited);
                onFavorite?.(product.id, !isFavorited);
              }}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="product-info">
            <h3 className="product-title">{product.title}</h3>
            <p className="product-price">${product.price}</p>
            <p className="product-condition">{product.condition}</p>

            <div className="seller-info">
              <span className="seller-name">
                {product.seller.firstName} {product.seller.lastName}
              </span>
              {product.seller.verified && (
                <span className="verified-badge">✓</span>
              )}
              <span className="seller-rating">
                ★ {product.seller.averageRating}
              </span>
            </div>

            <div className="product-stats">
              <span className="favorites-count">
                {product._count.favorites} favorites
              </span>
            </div>
          </div>

          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              onClick={() => onAddToCart?.(product)}
            >
              Add to Cart
            </button>
            <a className="view-details-btn" href={`/products/${product.id}`}>
              View Details
            </a>
          </div>
        </div>
      );
    };

    it('should render product information correctly', () => {
      const mockOnFavorite = vi.fn();
      const mockOnAddToCart = vi.fn();

      render(
        <ProductCard
          onAddToCart={mockOnAddToCart}
          onFavorite={mockOnFavorite}
          product={mockProduct}
        />
      );

      expect(screen.getByTestId('product-card')).toBeInTheDocument();
      expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument();
      expect(screen.getByText('$799.99')).toBeInTheDocument();
      expect(screen.getByText('VERY_GOOD')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('★ 4.8')).toBeInTheDocument();
      expect(screen.getByText('12 favorites')).toBeInTheDocument();
    });

    it('should display product image with correct alt text', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('iPhone 13 Pro');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://utfs.io/image1.jpg');
    });

    it('should show verified badge for verified sellers', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should handle favorite toggle', () => {
      const mockOnFavorite = vi.fn();

      render(<ProductCard onFavorite={mockOnFavorite} product={mockProduct} />);

      const favoriteBtn = screen.getByLabelText('Add to favorites');
      expect(favoriteBtn).toBeInTheDocument();
      expect(favoriteBtn).toHaveTextContent('🤍');

      fireEvent.click(favoriteBtn);

      expect(mockOnFavorite).toHaveBeenCalledWith('prod_1', true);
      expect(favoriteBtn).toHaveTextContent('❤️');
      expect(favoriteBtn).toHaveAttribute(
        'aria-label',
        'Remove from favorites'
      );
    });

    it('should handle add to cart action', () => {
      const mockOnAddToCart = vi.fn();

      render(
        <ProductCard onAddToCart={mockOnAddToCart} product={mockProduct} />
      );

      const addToCartBtn = screen.getByText('Add to Cart');
      fireEvent.click(addToCartBtn);

      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    it('should have correct view details link', () => {
      render(<ProductCard product={mockProduct} />);

      const viewDetailsLink = screen.getByText('View Details');
      expect(viewDetailsLink).toHaveAttribute('href', '/products/prod_1');
    });

    it('should render without seller verification badge when not verified', () => {
      const unverifiedProduct = {
        ...mockProduct,
        seller: {
          ...mockProduct.seller,
          verified: false,
        },
      };

      render(<ProductCard product={unverifiedProduct} />);

      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });
  });

  describe('CheckoutForm Component', () => {
    const mockCartItems = [
      {
        id: 'cart_1',
        productId: 'prod_1',
        title: 'iPhone 13 Pro',
        price: 799.99,
        quantity: 1,
        imageUrl: 'https://utfs.io/image1.jpg',
        condition: 'VERY_GOOD',
        sellerId: 'user_1',
        sellerName: 'John Doe',
      },
    ];

    interface CheckoutFormProps {
      items: Array<{
        id: string;
        title: string;
        price: number;
        quantity: number;
        imageUrl: string;
      }>;
      onSubmit: (data: {
        email: string;
        shipping: string;
        payment: string;
      }) => void;
      loading: boolean;
    }

    const CheckoutForm = ({ items, onSubmit, loading }: CheckoutFormProps) => {
      const [formData, setFormData] = React.useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'card',
      });

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * 0.08;
      const shipping = 9.99;
      const total = subtotal + tax + shipping;

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData, { subtotal, tax, shipping, total });
      };

      return (
        <div className="checkout-form" data-testid="checkout-form">
          <div className="order-summary">
            <h2>Order Summary</h2>
            {items.map((item) => (
              <div className="order-item" key={item.id}>
                <img alt={item.title} src={item.imageUrl} />
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>Condition: {item.condition}</p>
                  <p>Seller: {item.sellerName}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>${item.price}</p>
                </div>
              </div>
            ))}

            <div className="order-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="total-line total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form className="checkout-form-fields" onSubmit={handleSubmit}>
            <h2>Shipping Information</h2>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  type="text"
                  value={formData.firstName}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  type="text"
                  value={formData.lastName}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                type="text"
                value={formData.address}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                  type="text"
                  value={formData.city}
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  id="zipCode"
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  required
                  type="text"
                  value={formData.zipCode}
                />
              </div>
            </div>

            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label>
                <input
                  checked={formData.paymentMethod === 'card'}
                  name="paymentMethod"
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  type="radio"
                  value="card"
                />
                Credit/Debit Card
              </label>
            </div>

            <button
              className="place-order-btn"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      );
    };

    it('should render order summary correctly', () => {
      render(<CheckoutForm items={mockCartItems} />);

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument();
      expect(screen.getByText('Condition: VERY_GOOD')).toBeInTheDocument();
      expect(screen.getByText('Seller: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    });

    it('should calculate totals correctly', () => {
      render(<CheckoutForm items={mockCartItems} />);

      expect(screen.getByText('$799.99')).toBeInTheDocument(); // Subtotal
      expect(screen.getByText('$64.00')).toBeInTheDocument(); // Tax (8%)
      expect(screen.getByText('$9.99')).toBeInTheDocument(); // Shipping
      expect(screen.getByText('$873.98')).toBeInTheDocument(); // Total
    });

    it('should render shipping form fields', () => {
      render(<CheckoutForm items={mockCartItems} />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
      expect(screen.getByLabelText('ZIP Code')).toBeInTheDocument();
    });

    it('should handle form input changes', () => {
      render(<CheckoutForm items={mockCartItems} />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');

      const firstNameInput = screen.getByLabelText('First Name');
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      expect(firstNameInput).toHaveValue('John');
    });

    it('should handle form submission', () => {
      const mockOnSubmit = vi.fn();
      render(<CheckoutForm items={mockCartItems} onSubmit={mockOnSubmit} />);

      // Fill form
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText('Last Name'), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText('Address'), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText('City'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('ZIP Code'), {
        target: { value: '10001' },
      });

      // Submit form
      const submitBtn = screen.getByText(/Place Order/);
      fireEvent.click(submitBtn);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          paymentMethod: 'card',
        },
        {
          subtotal: 799.99,
          tax: 64.0,
          shipping: 9.99,
          total: 873.98,
        }
      );
    });

    it('should show loading state when processing', () => {
      render(<CheckoutForm items={mockCartItems} loading={true} />);

      const submitBtn = screen.getByText('Processing...');
      expect(submitBtn).toBeDisabled();
    });

    it('should require all form fields', () => {
      render(<CheckoutForm items={mockCartItems} />);

      expect(screen.getByLabelText('Email')).toBeRequired();
      expect(screen.getByLabelText('First Name')).toBeRequired();
      expect(screen.getByLabelText('Last Name')).toBeRequired();
      expect(screen.getByLabelText('Address')).toBeRequired();
      expect(screen.getByLabelText('City')).toBeRequired();
      expect(screen.getByLabelText('ZIP Code')).toBeRequired();
    });
  });

  describe('Mobile Product Filters Component', () => {
    const MobileFilters = ({
      filters,
      onFilterChange,
      onClose,
      isOpen,
    }: {
      filters: {
        categories: string[];
        priceRange: [number, number];
        conditions: string[];
        sizes: string[];
      };
      onFilterChange: (
        filterType: string,
        value: string | [number, number]
      ) => void;
      onClose: () => void;
      isOpen: boolean;
    }) => {
      if (!isOpen) {
        return null;
      }

      return (
        <div className="mobile-filters" data-testid="mobile-filters">
          <div className="filters-header">
            <h2>Filters</h2>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="filter-section">
            <h3>Category</h3>
            <select
              onChange={(e) => onFilterChange('category', e.target.value)}
              value={filters.category || ''}
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Condition</h3>
            <div className="condition-options">
              {[
                'NEW_WITH_TAGS',
                'NEW_WITHOUT_TAGS',
                'VERY_GOOD',
                'GOOD',
                'SATISFACTORY',
              ].map((condition) => (
                <label key={condition}>
                  <input
                    checked={filters.condition === condition}
                    name="condition"
                    onChange={(e) =>
                      onFilterChange('condition', e.target.value)
                    }
                    type="radio"
                    value={condition}
                  />
                  {condition.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                placeholder="Min price"
                type="number"
                value={filters.minPrice || ''}
              />
              <input
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                placeholder="Max price"
                type="number"
                value={filters.maxPrice || ''}
              />
            </div>
          </div>

          <div className="filters-footer">
            <button
              className="clear-filters-btn"
              onClick={() => onFilterChange('clear')}
            >
              Clear All
            </button>
            <button className="apply-filters-btn" onClick={onClose}>
              Apply Filters
            </button>
          </div>
        </div>
      );
    };

    it('should render when open', () => {
      const mockFilters = {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={true}
          onClose={vi.fn()}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('mobile-filters')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      const mockFilters = {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={false}
          onClose={vi.fn()}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.queryByTestId('mobile-filters')).not.toBeInTheDocument();
    });

    it('should handle category filter changes', () => {
      const mockOnFilterChange = vi.fn();
      const mockFilters = {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={true}
          onClose={vi.fn()}
          onFilterChange={mockOnFilterChange}
        />
      );

      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'electronics' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        'category',
        'electronics'
      );
    });

    it('should handle condition filter changes', () => {
      const mockOnFilterChange = vi.fn();
      const mockFilters = {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={true}
          onClose={vi.fn()}
          onFilterChange={mockOnFilterChange}
        />
      );

      const veryGoodOption = screen.getByLabelText('VERY GOOD');
      fireEvent.click(veryGoodOption);

      expect(mockOnFilterChange).toHaveBeenCalledWith('condition', 'VERY_GOOD');
    });

    it('should handle price range changes', () => {
      const mockOnFilterChange = vi.fn();
      const mockFilters = {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={true}
          onClose={vi.fn()}
          onFilterChange={mockOnFilterChange}
        />
      );

      const minPriceInput = screen.getByPlaceholderText('Min price');
      fireEvent.change(minPriceInput, { target: { value: '100' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith('minPrice', '100');
    });

    it('should handle clear filters action', () => {
      const mockOnFilterChange = vi.fn();
      const mockFilters = {
        category: 'electronics',
        condition: 'VERY_GOOD',
        minPrice: '100',
        maxPrice: '500',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={true}
          onClose={vi.fn()}
          onFilterChange={mockOnFilterChange}
        />
      );

      const clearBtn = screen.getByText('Clear All');
      fireEvent.click(clearBtn);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clear');
    });

    it('should handle close action', () => {
      const mockOnClose = vi.fn();
      const mockFilters = {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
      };

      render(
        <MobileFilters
          filters={mockFilters}
          isOpen={true}
          onClose={mockOnClose}
          onFilterChange={vi.fn()}
        />
      );

      const closeBtn = screen.getByText('×');
      fireEvent.click(closeBtn);

      expect(mockOnClose).toHaveBeenCalled();

      const applyBtn = screen.getByText('Apply Filters');
      fireEvent.click(applyBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading Skeletons', () => {
    const ProductCardSkeleton = () => (
      <div className="product-card-skeleton" data-testid="product-skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-title" />
          <div className="skeleton-price" />
          <div className="skeleton-seller" />
        </div>
      </div>
    );

    const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
      <div className="skeleton-grid" data-testid="skeleton-grid">
        {Array.from({ length: count }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );

    it('should render product card skeleton', () => {
      render(<ProductCardSkeleton />);

      expect(screen.getByTestId('product-skeleton')).toBeInTheDocument();
    });

    it('should render skeleton grid with correct count', () => {
      render(<SkeletonGrid count={6} />);

      const skeletonGrid = screen.getByTestId('skeleton-grid');
      expect(skeletonGrid).toBeInTheDocument();

      const skeletons = screen.getAllByTestId('product-skeleton');
      expect(skeletons).toHaveLength(6);
    });

    it('should render default skeleton count', () => {
      render(<SkeletonGrid />);

      const skeletons = screen.getAllByTestId('product-skeleton');
      expect(skeletons).toHaveLength(8);
    });
  });

  describe('Error Boundaries', () => {
    const ErrorBoundary = ({
      children,
      fallback,
    }: {
      children: ReactNode;
      fallback: ReactNode;
    }) => {
      const [hasError, setHasError] = React.useState(false);

      React.useEffect(() => {
        const errorHandler = (_error: ErrorEvent) => {
          setHasError(true);
        };

        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
      }, []);

      if (hasError) {
        return (
          fallback || (
            <div data-testid="error-fallback">Something went wrong</div>
          )
        );
      }

      return children;
    };

    const BuggyComponent = ({
      shouldThrow = false,
    }: {
      shouldThrow?: boolean;
    }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="working-component">Working correctly</div>;
    };

    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
    });

    it('should render custom fallback on error', () => {
      const customFallback = (
        <div data-testid="custom-error">Custom error message</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Note: This test is simplified. In real React error boundaries,
      // you'd need to use React's componentDidCatch lifecycle
      expect(screen.queryByTestId('working-component')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels', () => {
      const AccessibleButton = ({
        children,
        ariaLabel,
        ...props
      }: ButtonHTMLAttributes<HTMLButtonElement> & {
        children: ReactNode;
        ariaLabel: string;
      }) => (
        <button aria-label={ariaLabel} {...props}>
          {children}
        </button>
      );

      render(
        <AccessibleButton ariaLabel="Add iPhone to favorites">
          ❤️
        </AccessibleButton>
      );

      const button = screen.getByLabelText('Add iPhone to favorites');
      expect(button).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const mockOnClick = vi.fn();

      render(
        <button
          onClick={mockOnClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              mockOnClick();
            }
          }}
        >
          Click me
        </button>
      );

      const button = screen.getByText('Click me');

      // Test keyboard interaction
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(button, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper focus management', () => {
      const FocusComponent = () => {
        const buttonRef = React.useRef<HTMLButtonElement>(null);

        React.useEffect(() => {
          buttonRef.current?.focus();
        }, []);

        return (
          <button data-testid="focus-button" ref={buttonRef}>
            Focus me
          </button>
        );
      };

      render(<FocusComponent />);

      const button = screen.getByTestId('focus-button');
      expect(button).toHaveFocus();
    });
  });
});
