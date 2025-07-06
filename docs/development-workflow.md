# Development Workflow Guide

## 🎯 Purpose

This guide provides a comprehensive step-by-step development workflow for contributing to the Threadly project, ensuring consistency with Next-Forge patterns and maintaining code quality standards.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git
- PostgreSQL (local or remote)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd threadly

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
pnpm db:push
pnpm seed

# Start development
pnpm dev
```

## 🏗️ Project Structure Understanding

### Application Ports
- **Web App** (Customer): http://localhost:3001
- **Dashboard App** (Seller): http://localhost:3000  
- **API Service**: http://localhost:3002
- **Storybook**: http://localhost:6006

### Package Organization
```
packages/
├── auth/              # Clerk authentication
├── database/          # Prisma schema & client
├── design-system/     # UI components
├── validation/        # Zod schemas
├── observability/     # Monitoring & logging
├── payments/          # Stripe integration
├── search/            # Algolia search
└── [20+ others]/      # Feature packages
```

## 🔄 Development Workflow

### 1. Setting Up Your Development Environment

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Required environment variables
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
```

#### Database Setup
```bash
# Push schema to database
pnpm db:push

# Seed development data
pnpm seed

# Open database studio (optional)
pnpm db:studio
```

#### Verify Setup
```bash
# Check all services start correctly
pnpm dev

# Run health checks
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health  
curl http://localhost:3002/api/health
```

### 2. Feature Development Process

#### Branch Naming Convention
```bash
# Feature branches
feature/add-product-reviews
feature/improve-search-filters

# Bug fixes
fix/cart-quantity-update
fix/payment-processing-error

# Refactoring
refactor/optimize-database-queries
refactor/cleanup-auth-flow

# Documentation
docs/update-api-documentation
docs/add-testing-guide
```

#### Creating a New Feature

**Step 1: Create Feature Branch**
```bash
git checkout -b feature/add-product-reviews
```

**Step 2: Understand the Requirements**
- Check existing issues/PRs
- Review architecture decisions
- Understand affected packages

**Step 3: Plan Implementation**
```typescript
// Example: Adding product reviews
// Affected packages:
// - packages/database (schema changes)
// - packages/validation (review schemas)  
// - packages/design-system (review components)
// - apps/web (customer review UI)
// - apps/app (seller review management)
// - apps/api (review API endpoints)
```

**Step 4: Implement Changes**

1. **Database Schema Changes**
```typescript
// packages/database/prisma/schema.prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      @db.SmallInt
  comment   String?
  
  // Relations
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([productId, userId]) // One review per user per product
  @@index([productId, rating])
}
```

2. **Validation Schemas**
```typescript
// packages/validation/schemas/review.ts
export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
```

3. **API Routes**
```typescript
// apps/api/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { createReviewSchema } from '@repo/validation/schemas/review';

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    const review = await database.review.create({
      data: {
        ...validated,
        userId: user.userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
```

4. **UI Components**
```typescript
// packages/design-system/components/marketplace/review-card.tsx
import { Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { Review } from '@repo/database';

interface ReviewCardProps {
  review: Review & {
    user: {
      firstName: string;
      lastName: string;
      imageUrl?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {review.user.firstName} {review.user.lastName}
            </span>
          </div>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        {review.comment && (
          <p className="text-sm text-gray-600">{review.comment}</p>
        )}
        <time className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </time>
      </CardContent>
    </Card>
  );
}
```

**Step 5: Update Package Exports**
```typescript
// packages/design-system/components.ts
export { ReviewCard } from './components/marketplace/review-card';
export { ReviewForm } from './components/marketplace/review-form';

// packages/validation/index.ts
export * from './schemas/review';
```

**Step 6: Testing**
```bash
# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests (when available)
pnpm test

# Test in browser
pnpm dev
```

### 3. Code Quality Standards

#### TypeScript Requirements
```typescript
// ✅ Good: Proper typing
interface ProductWithReviews {
  id: string;
  title: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

// ❌ Bad: Using any
function processReviews(data: any) {
  return data.reviews; // No type safety
}

// ✅ Good: Type-safe with validation
function processReviews(data: unknown) {
  const validated = productWithReviewsSchema.parse(data);
  return validated.reviews; // Type safe
}
```

#### Next.js 15 Patterns
```typescript
// ✅ Correct: Async params
export default async function ReviewPage({ 
  params 
}: { 
  params: Promise<{ productId: string }> 
}) {
  const { productId } = await params; // Must await
  const reviews = await getReviews(productId);
  return <ReviewList reviews={reviews} />;
}

// ❌ Wrong: Direct params access
export default function ReviewPage({ 
  params 
}: { 
  params: { productId: string } 
}) {
  const reviews = await getReviews(params.productId); // Will break
}
```

#### Import Standards
```typescript
// ✅ Correct: Package exports
import { ReviewCard, ReviewForm } from '@repo/design-system/components';
import { createReviewSchema } from '@repo/validation';
import { database } from '@repo/database';

// ❌ Wrong: Deep imports
import { ReviewCard } from '@repo/design-system/components/marketplace/review-card';
import { createReviewSchema } from '@repo/validation/schemas/review';
```

### 4. Testing Your Changes

#### Manual Testing Checklist
```bash
# 1. Start all services
pnpm dev

# 2. Test each application
# Web App (localhost:3001)
- [ ] Navigate to product page
- [ ] Submit review form
- [ ] View submitted reviews

# Dashboard App (localhost:3000) 
- [ ] View reviews in seller dashboard
- [ ] Moderate inappropriate reviews

# API (localhost:3002)
- [ ] Test API endpoints directly
curl -X POST localhost:3002/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"productId":"...", "rating":5}'

# 3. Cross-browser testing
- [ ] Chrome
- [ ] Firefox  
- [ ] Safari
- [ ] Mobile Chrome
```

#### Automated Testing (When Available)
```bash
# Unit tests
pnpm test packages/validation

# Integration tests  
pnpm test apps/api

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### 5. Database Migrations

#### Schema Changes
```bash
# 1. Update schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add-reviews

# 3. Update seed data if needed
# packages/database/prisma/seed.ts

# 4. Test migration
pnpm db:push
pnpm seed
```

#### Migration Best Practices
- Always backup production data before migrations
- Test migrations on staging environment first
- Use nullable fields for new columns initially
- Create indexes for query performance

### 6. Commit and Pull Request Process

#### Commit Message Format
```bash
# Format: type(scope): description
feat(reviews): add product review system
fix(auth): resolve session timeout issue
refactor(database): optimize product queries
docs(api): update endpoint documentation

# Examples
git commit -m "feat(reviews): add review submission form"
git commit -m "fix(payments): handle failed payment webhook"
git commit -m "refactor(ui): consolidate button variants"
```

#### Pre-commit Checklist
```bash
# 1. Code quality
pnpm typecheck    # No TypeScript errors
pnpm lint         # No linting errors
pnpm test         # All tests pass

# 2. Build verification
pnpm build        # Successful build

# 3. Manual testing
# - Feature works as expected
# - No breaking changes
# - Responsive design tested
```

#### Pull Request Template
```markdown
## 📝 Description
Brief description of changes and motivation.

## 🔧 Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## ✅ Testing
- [ ] Manual testing completed
- [ ] All automated tests pass
- [ ] Cross-browser testing done

## 📸 Screenshots (if applicable)
[Add screenshots for UI changes]

## 🔗 Related Issues
Closes #123
```

## 🔧 Common Development Tasks

### Adding a New Package
```bash
# 1. Create package directory
mkdir packages/new-feature
cd packages/new-feature

# 2. Initialize package.json
cat > package.json << EOF
{
  "name": "@repo/new-feature",
  "version": "0.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts"
  },
  "dependencies": {
    "zod": "^3.25.28"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.8.3"
  }
}
EOF

# 3. Create TypeScript config
cat > tsconfig.json << EOF
{
  "extends": "@repo/typescript-config/base.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# 4. Create main export
echo "export const newFeature = 'Hello World';" > index.ts

# 5. Add to workspace
# (Already included via packages/* in pnpm-workspace.yaml)
```

### Updating Dependencies
```bash
# Update all dependencies
pnpm bump-deps

# Update specific package
pnpm update @clerk/nextjs

# Update UI components
pnpm bump-ui
```

### Environment Variable Changes
```bash
# 1. Update package keys.ts
# packages/new-package/keys.ts

# 2. Update app env.ts
# apps/app/env.ts - add new package to extends array

# 3. Update .env.example files
# Add new variables to relevant .env.example files

# 4. Update documentation
# Update environment variable documentation
```

## 🚨 Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
pnpm install

# Regenerate Prisma client
cd packages/database
npx prisma generate

# Check imports
pnpm typecheck --listFiles
```

#### Build Failures
```bash
# Clear all caches
pnpm clean
rm -rf node_modules
pnpm install

# Check individual package builds
cd packages/problematic-package
pnpm build
```

#### Database Issues
```bash
# Reset database
pnpm db:push --force-reset
pnpm seed

# Check connection
cd packages/database
npx prisma studio
```

#### Import Resolution
```bash
# Check package exports
cat packages/design-system/package.json | jq .exports

# Verify TypeScript paths
pnpm typecheck --traceResolution
```

### Getting Help

1. **Check Documentation**: Review existing docs and ADRs
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask Team**: Reach out to team members
4. **Create Issue**: Document the problem for future reference

## 📊 Performance Considerations

### Development Performance
```bash
# Use turbo for faster builds
pnpm build --cache-dir=.turbo

# Skip environment validation during development
SKIP_ENV_VALIDATION=true pnpm dev

# Use specific app development
pnpm dev --filter=@repo/web
```

### Monitoring Changes
```bash
# Watch for file changes
pnpm dev --parallel

# Check bundle sizes
ANALYZE=true pnpm build

# Monitor build times
time pnpm build
```

## 🎯 Next Steps

After mastering this workflow:

1. **Contribute to Documentation**: Help improve this guide
2. **Add Testing**: Implement comprehensive test coverage
3. **Performance Optimization**: Help optimize bundle sizes and Core Web Vitals
4. **Developer Experience**: Suggest workflow improvements

---

*This development workflow ensures consistent, high-quality contributions to the Threadly project while maintaining Next-Forge standards.*