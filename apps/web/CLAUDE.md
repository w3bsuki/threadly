# 🌐 Web App (Customer-Facing Marketplace)

**Claude Agent Context for Threadly Web Application**

---

## 📋 App Overview
This is the **customer-facing marketplace** where users browse, search, and purchase fashion items. Built with Next.js 15, TypeScript, and Tailwind.

## 🏗️ Architecture
```
apps/web/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Shared UI components
│   ├── lib/          # Utilities and configurations
│   └── styles/       # Global styles
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

## 🧠 Agent Instructions

### When Working in This Directory:
1. **You are working on the CUSTOMER-FACING web app**
2. **Focus on user experience and performance**
3. **Follow strict TypeScript and accessibility standards**
4. **Use existing design system components from @repo/design-system**

### Key Principles:
- **Mobile-first design** - Most users are on mobile
- **Performance is critical** - Every millisecond matters for conversions
- **SEO optimization** - For organic discovery
- **Accessibility** - WCAG 2.1 AA compliance

## 🛠️ Development Commands

```bash
# Development
pnpm dev                    # Start dev server on :3000
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix linting issues
pnpm typecheck              # TypeScript validation

# Testing
pnpm test                   # Run tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report

# Database (from root)
pnpm db:push                # Update schema
pnpm db:studio              # Database browser
```

## 🎯 Core Features

### Public Pages
- **Homepage** (`/`) - Hero, featured items, categories
- **Browse** (`/browse`) - Product grid with filters
- **Product** (`/product/[id]`) - Product details page
- **Seller Profile** (`/seller/[id]`) - Seller showcase
- **Search** (`/search`) - Search results

### User Pages (Auth Required)
- **Cart** (`/cart`) - Shopping cart
- **Checkout** (`/checkout`) - Purchase flow
- **Profile** (`/profile`) - User settings
- **Favorites** (`/favorites`) - Saved items
- **Orders** (`/orders`) - Purchase history

## 🎨 Design System Usage

```typescript
// Use design system components
import { Button, Card, Input } from '@repo/design-system';

// Follow naming conventions
const ProductCard = () => {
  return (
    <Card className="product-card">
      <Button variant="primary" size="md">
        Add to Cart
      </Button>
    </Card>
  );
};
```

## 📡 API Integration

```typescript
// API calls to backend (apps/api)
const product = await fetch('/api/products/123').then(r => r.json());

// Use React Query for caching
const { data: products } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters)
});
```

## 🔐 Authentication

```typescript
// Using Clerk for auth
import { useUser, SignInButton } from '@clerk/nextjs';

const { user, isLoaded } = useUser();
```

## 💳 Payments

```typescript
// Stripe integration
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
```

## 🎪 State Management

```typescript
// Zustand stores in lib/stores/
import { useCartStore } from '@/lib/stores/cart-store';
import { useFiltersStore } from '@/lib/stores/filters-store';
```

## 📊 Analytics & Monitoring

```typescript
// PostHog for analytics
import { posthog } from '@/lib/analytics';
posthog.capture('product_viewed', { productId });

// Sentry for error tracking (auto-configured)
```

## 🌍 Internationalization

```typescript
// Using next-intl
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
const title = t('welcomeMessage');
```

## 🚀 Performance Guidelines

1. **Image Optimization**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/product.jpg"
     alt="Product"
     width={400}
     height={300}
     priority={isAboveFold}
   />
   ```

2. **Code Splitting**
   ```typescript
   // Lazy load heavy components
   const ProductImageGallery = dynamic(() => import('./ProductImageGallery'));
   ```

3. **Bundle Analysis**
   ```bash
   pnpm analyze  # Check bundle sizes
   ```

## 🧪 Testing Strategy

```typescript
// Component tests with React Testing Library
import { render, screen } from '@testing-library/react';

test('renders product card', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Add to Cart')).toBeInTheDocument();
});

// E2E tests with Playwright (run from root)
pnpm test:e2e
```

## 🔍 SEO Optimization

```typescript
// Next.js metadata API
export const metadata: Metadata = {
  title: 'Vintage Denim Jacket - Threadly',
  description: 'Authentic vintage denim jacket in excellent condition...',
  openGraph: {
    images: ['/product-image.jpg'],
  },
};
```

## ⚠️ Common Pitfalls

1. **Don't fetch data in components** - Use server components or React Query
2. **Avoid 'use client' unless needed** - Server components by default
3. **Always handle loading states** - Better UX
4. **Validate user inputs** - Security and UX
5. **Mobile-first CSS** - Start with mobile styles

## 🔄 Deployment

- **Auto-deploys** from `main` branch to production
- **Preview deploys** for all PRs
- **Environment**: Vercel
- **Domain**: https://threadly.com (when live)

## 📞 Getting Help

1. **Orchestrator Communication**
   - Check `../../../AGENT_COMM.md` for messages
   - Update progress in `../../../PROGRESS.md`
   - Report blockers in `../../../BLOCKERS.md`

2. **Other Agents**
   - API team: Working in `apps/api/`
   - Mobile team: Working in `apps/app/`
   - Design system: Working in `packages/design-system/`

3. **Resources**
   - Design System docs: `packages/design-system/README.md`
   - Database schema: `packages/database/schema.prisma`
   - Root project docs: `CLAUDE.md` (parent directory)

---

## 🎯 Current Priority Areas

*This section is updated by the orchestrator based on current tasks*

- [ ] Improve Core Web Vitals (LCP < 2.5s)
- [ ] Implement dark mode toggle
- [ ] Add product comparison feature
- [ ] Optimize image loading performance
- [ ] Enhance search functionality

---

**Remember**: You're building the face of Threadly. Every interaction shapes the user's experience. Make it delightful! ✨