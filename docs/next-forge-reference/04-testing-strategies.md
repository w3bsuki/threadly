# Testing Strategies

## 🧪 Next-Forge Testing Philosophy

Next-Forge promotes comprehensive testing strategies that ensure code quality, prevent regressions, and maintain production reliability. The testing approach follows a pyramid structure with multiple layers of validation.

## 🏗️ Testing Architecture

### Testing Pyramid Structure

```
                    🔼 E2E Tests
                   (Playwright)
                 /              \
              🔼 Integration Tests
             (API Routes, Components)
           /                        \
        🔼 Unit Tests                🔼
       (Functions, Utils)         Component Tests
      /                          (React Testing Library)
   🔼 Type Tests
  (TypeScript)
```

### Test Distribution Guidelines

- **70% Unit Tests** - Fast, isolated, high coverage
- **20% Integration Tests** - API routes, component integration
- **10% E2E Tests** - Critical user journeys
- **100% Type Coverage** - TypeScript validation

## 📦 Package-Level Testing

### Core Shared Packages

Each package in the monorepo includes its own test suite:

```
packages/validation/
├── __tests__/
│   ├── schemas.test.ts
│   ├── middleware.test.ts
│   └── sanitize.test.ts
├── vitest.config.ts
└── package.json (test scripts)
```

### Validation Package Testing

```typescript
// packages/validation/__tests__/schemas.test.ts
import { describe, test, expect } from 'vitest';
import { createProductSchema, createUserSchema } from '../schemas';

describe('Product Schema Validation', () => {
  test('accepts valid product data', () => {
    const validProduct = {
      title: 'Vintage Denim Jacket',
      description: 'Authentic 1990s denim jacket in excellent condition',
      price: 89.99,
      categoryId: 'clj8k7h2l0000356n1qz8r9m3',
      images: ['https://example.com/image1.jpg']
    };
    
    expect(() => createProductSchema.parse(validProduct)).not.toThrow();
  });
  
  test('rejects invalid price values', () => {
    const invalidProduct = {
      title: 'Test Product',
      description: 'Test description',
      price: -10, // Invalid negative price
      categoryId: 'clj8k7h2l0000356n1qz8r9m3',
      images: ['https://example.com/image1.jpg']
    };
    
    expect(() => createProductSchema.parse(invalidProduct)).toThrow();
  });
  
  test('sanitizes and validates user input', () => {
    const userInput = {
      title: '  Vintage Jacket  ',
      description: '<script>alert("xss")</script>Great jacket!',
      price: '89.99', // String that should be coerced
    };
    
    const result = createProductSchema.parse(userInput);
    expect(result.title).toBe('Vintage Jacket');
    expect(result.description).not.toContain('<script>');
    expect(typeof result.price).toBe('number');
  });
});
```

### Database Package Testing

```typescript
// packages/database/__tests__/queries.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { database } from '../index';

describe('Database Queries', () => {
  beforeEach(async () => {
    // Clean test database
    await database.order.deleteMany();
    await database.product.deleteMany();
    await database.user.deleteMany();
  });
  
  afterEach(async () => {
    // Cleanup after each test
    await database.$disconnect();
  });
  
  test('creates product with seller relationship', async () => {
    const seller = await database.user.create({
      data: {
        clerkId: 'test-clerk-id',
        email: 'seller@test.com',
        firstName: 'Test',
        lastName: 'Seller'
      }
    });
    
    const product = await database.product.create({
      data: {
        title: 'Test Product',
        description: 'Test Description',
        price: new Decimal('29.99'),
        sellerId: seller.id,
        status: 'AVAILABLE'
      }
    });
    
    expect(product.sellerId).toBe(seller.id);
    expect(product.price.toNumber()).toBe(29.99);
  });
  
  test('enforces database constraints', async () => {
    // Should fail without required fields
    await expect(
      database.product.create({
        data: {
          title: 'Incomplete Product'
          // Missing required fields
        }
      })
    ).rejects.toThrow();
  });
});
```

## 🌐 Application-Level Testing

### API Route Testing

```typescript
// apps/api/__tests__/products.test.ts
import { describe, test, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { createMocks } from 'node-mocks-http';
import handler from '../app/api/products/route';

describe('/api/products', () => {
  test('GET returns products with pagination', async () => {
    await testApiHandler({
      appHandler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          query: { page: '1', limit: '10' }
        });
        
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data.products)).toBe(true);
        expect(data.data.pagination).toBeDefined();
        expect(data.data.pagination.page).toBe(1);
        expect(data.data.pagination.limit).toBe(10);
      }
    });
  });
  
  test('POST creates product with authentication', async () => {
    const productData = {
      title: 'New Product',
      description: 'Product description',
      price: 49.99,
      categoryId: 'test-category-id'
    };
    
    await testApiHandler({
      appHandler: { POST: handler.POST },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(productData)
        });
        
        const data = await res.json();
        
        expect(res.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.product.title).toBe(productData.title);
      }
    });
  });
  
  test('handles validation errors properly', async () => {
    const invalidData = {
      title: '', // Too short
      price: -10 // Invalid
    };
    
    await testApiHandler({
      appHandler: { POST: handler.POST },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData)
        });
        
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('validation');
      }
    });
  });
});
```

### Next.js App Router Testing

```typescript
// apps/web/__tests__/product-page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ProductPage from '../app/[locale]/product/[id]/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/product/123'
  }),
  useSearchParams: () => new URLSearchParams()
}));

// Mock API calls
vi.mock('@/lib/api', () => ({
  getProduct: vi.fn().mockResolvedValue({
    id: '123',
    title: 'Test Product',
    description: 'Test Description',
    price: new Decimal('29.99'),
    images: [{ imageUrl: '/test-image.jpg' }]
  })
}));

describe('ProductPage', () => {
  test('renders product information', async () => {
    const mockParams = Promise.resolve({ id: '123' });
    
    render(await ProductPage({ params: mockParams }));
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });
  });
  
  test('handles loading states', async () => {
    const mockParams = Promise.resolve({ id: '123' });
    
    render(await ProductPage({ params: mockParams }));
    
    // Should show loading skeleton initially
    expect(screen.getByTestId('product-skeleton')).toBeInTheDocument();
  });
});
```

## 🎭 Component Testing Strategies

### Design System Component Testing

```typescript
// packages/design-system/__tests__/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Button } from '../components/ui/button';

describe('Button Component', () => {
  test('renders with correct variant styles', () => {
    render(<Button variant="primary">Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('bg-primary');
  });
  
  test('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('supports disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });
  
  test('renders loading state', () => {
    render(<Button loading>Loading</Button>);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Complex Component Integration Testing

```typescript
// apps/app/__tests__/product-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { ProductForm } from '../app/(authenticated)/selling/new/components/product-form';

// Mock file upload
vi.mock('@/lib/uploadthing', () => ({
  uploadFiles: vi.fn().mockResolvedValue([
    { url: 'https://example.com/uploaded-image.jpg' }
  ])
}));

describe('ProductForm', () => {
  test('submits valid product data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<ProductForm onSubmit={onSubmit} />);
    
    // Fill out form
    await user.type(screen.getByLabelText('Product Title'), 'Vintage Jacket');
    await user.type(screen.getByLabelText('Description'), 'Beautiful vintage jacket');
    await user.type(screen.getByLabelText('Price'), '89.99');
    
    // Upload image
    const fileInput = screen.getByLabelText('Upload Images');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Product' }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Vintage Jacket',
        description: 'Beautiful vintage jacket',
        price: 89.99,
        images: ['https://example.com/uploaded-image.jpg']
      });
    });
  });
  
  test('validates required fields', async () => {
    render(<ProductForm onSubmit={vi.fn()} />);
    
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Create Product' }));
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Price must be positive')).toBeInTheDocument();
  });
});
```

## 🎭 End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical User Journey Testing

```typescript
// e2e/purchase-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Purchase Flow', () => {
  test('complete purchase journey', async ({ page }) => {
    // Navigate to product
    await page.goto('/product/vintage-denim-jacket');
    
    // Verify product details
    await expect(page.getByText('Vintage Denim Jacket')).toBeVisible();
    await expect(page.getByText('$89.99')).toBeVisible();
    
    // Add to cart
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByText('Added to cart')).toBeVisible();
    
    // Go to cart
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Vintage Denim Jacket')).toBeVisible();
    
    // Proceed to checkout
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    // Fill shipping information
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('San Francisco');
    await page.getByLabel('ZIP Code').fill('94105');
    
    // Fill payment information (test mode)
    await page.getByLabel('Card Number').fill('4242424242424242');
    await page.getByLabel('Expiry Date').fill('12/25');
    await page.getByLabel('CVC').fill('123');
    
    // Complete purchase
    await page.getByRole('button', { name: 'Complete Purchase' }).click();
    
    // Verify success
    await expect(page.getByText('Order Confirmed')).toBeVisible();
    await expect(page.getByText('Thank you for your purchase')).toBeVisible();
  });
  
  test('handles payment failures gracefully', async ({ page }) => {
    await page.goto('/product/vintage-denim-jacket');
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    // Use declined card number
    await page.getByLabel('Card Number').fill('4000000000000002');
    await page.getByLabel('Expiry Date').fill('12/25');
    await page.getByLabel('CVC').fill('123');
    
    await page.getByRole('button', { name: 'Complete Purchase' }).click();
    
    // Should show error message
    await expect(page.getByText('Payment failed')).toBeVisible();
    await expect(page.getByText('Please try a different payment method')).toBeVisible();
  });
});
```

### Authentication Flow Testing

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up and sign in', async ({ page }) => {
    // Sign up
    await page.goto('/sign-up');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Confirm Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Complete profile
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByRole('button', { name: 'Complete Profile' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome, John!')).toBeVisible();
  });
  
  test('seller onboarding flow', async ({ page }) => {
    // Authenticate as new user
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('seller@example.com');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Go to selling
    await page.getByRole('link', { name: 'Start Selling' }).click();
    
    // Should prompt for Stripe Connect
    await expect(page.getByText('Connect your Stripe account')).toBeVisible();
    
    // Mock Stripe Connect flow
    await page.getByRole('button', { name: 'Connect Stripe' }).click();
    
    // Should redirect to Stripe (in test, mock this)
    // After Stripe flow, should return to seller dashboard
    await expect(page.getByText('Seller Dashboard')).toBeVisible();
  });
});
```

## 🔄 CI/CD Testing Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Lint
        run: pnpm lint
      
      - name: Run unit tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Build
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: |
            playwright-report/
            test-results/
```

## 📊 Testing Metrics and Coverage

### Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.next/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@repo': resolve(__dirname, '../../packages'),
    },
  },
});
```

### Test Quality Metrics

```typescript
// scripts/test-metrics.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestMetrics {
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  testCount: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  performance: {
    duration: number;
    slowestTest: string;
  };
}

async function generateTestMetrics(): Promise<TestMetrics> {
  // Run tests with coverage
  const { stdout } = await execAsync('pnpm test -- --coverage --reporter=json');
  const results = JSON.parse(stdout);
  
  return {
    coverage: {
      lines: results.coverageMap.total.lines.pct,
      functions: results.coverageMap.total.functions.pct,
      branches: results.coverageMap.total.branches.pct,
      statements: results.coverageMap.total.statements.pct,
    },
    testCount: {
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numPendingTests,
    },
    performance: {
      duration: results.duration,
      slowestTest: results.slowestTest?.title || 'N/A',
    },
  };
}

// Export metrics for CI/CD reporting
generateTestMetrics().then(metrics => {
  console.log('Test Metrics:', metrics);
  
  // Fail if coverage thresholds not met
  if (metrics.coverage.lines < 80) {
    process.exit(1);
  }
});
```

## 🎯 Testing Best Practices Summary

### Do's ✅

1. **Write tests first** - Test-driven development for critical features
2. **Test user behavior** - Focus on what users actually do
3. **Mock external dependencies** - Keep tests fast and reliable
4. **Use meaningful test names** - Describe the expected behavior
5. **Test error conditions** - Not just happy paths
6. **Maintain test data** - Use factories and fixtures
7. **Run tests in CI/CD** - Automated validation

### Don'ts ❌

1. **Don't test implementation details** - Test behavior, not code structure
2. **Don't write flaky tests** - Fix intermittent failures immediately
3. **Don't ignore slow tests** - Optimize or move to appropriate layer
4. **Don't mock everything** - Integration points need real testing
5. **Don't skip accessibility tests** - Include a11y in component tests
6. **Don't forget mobile testing** - Test responsive behavior
7. **Don't neglect security testing** - Test auth, validation, and permissions

This comprehensive testing strategy ensures that your Next-Forge application maintains high quality, reliability, and user experience across all environments and use cases.