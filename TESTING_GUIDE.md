# Testing Guide

## Overview

Comprehensive testing setup with accessibility, security, and E2E testing.

## Test Types

### 1. Unit & Integration Tests
```bash
pnpm test                 # Run all unit tests
pnpm test:watch          # Watch mode
```

### 2. Accessibility Tests
```bash
pnpm test:a11y          # Run a11y tests only
```

**Coverage:**
- Form accessibility (labels, ARIA, keyboard navigation)
- Navigation structure (skip links, landmarks, headings)
- Screen reader compatibility

### 3. E2E Tests
```bash
pnpm test:e2e           # Run all E2E tests
pnpm test:e2e:ui        # Interactive UI mode
```

**Coverage:**
- Authentication flows
- Shopping cart and checkout
- Admin panel functionality
- Responsive design

### 4. Security Tests
```bash
pnpm test:security      # Run security tests only
```

**Coverage:**
- API authentication/authorization
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Session management

## Test Structure

```
apps/
├── app/__tests__/
│   ├── a11y/           # Accessibility tests
│   │   └── auth-forms.test.tsx
│   └── security/       # Security tests
└── web/__tests__/
    ├── a11y/
    │   └── navigation.test.tsx
    └── security/
        └── api-security.test.ts

e2e/                    # End-to-end tests
├── auth.spec.ts
├── shopping.spec.ts
├── admin.spec.ts
└── security.spec.ts

packages/testing/src/a11y/  # A11y utilities
├── axe-matchers.ts
├── test-utils.tsx
└── index.ts
```

## Writing Tests

### Accessibility Tests
```typescript
import { renderFormWithA11y } from '@repo/testing/a11y';
import '@repo/testing/a11y/axe-matchers';

it('should have no a11y violations', async () => {
  const { container } = renderFormWithA11y(<MyForm />);
  await expect(container).toHaveNoViolations();
});
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/.*sign-in.*/);
});
```

## CI/CD Integration

All tests run automatically on:
- Pull requests
- Pushes to main/develop
- Before deployment

**Test Requirements:**
- All tests must pass
- No accessibility violations
- Security scans must pass
- Build must succeed

## Coverage Requirements

- **Unit Tests:** 80% minimum
- **A11y Tests:** Zero violations
- **E2E Tests:** Critical user paths
- **Security:** All auth/input endpoints

## Debugging

### Failed A11y Tests
```bash
# Run with detailed output
pnpm test:a11y --reporter=verbose

# Check specific rules
axe-core documentation: https://dequeuniversity.com/rules/axe/
```

### Failed E2E Tests
```bash
# Run with UI for debugging
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e tests/auth.spec.ts
```

### Security Issues
- Check input validation in API routes
- Verify CORS configuration
- Review authentication middleware
- Audit dependencies with `npm audit`

## Best Practices

1. **Write tests first** - TDD approach
2. **Test user behavior** - Not implementation details
3. **Use semantic queries** - `getByRole`, `getByLabelText`
4. **Mock external services** - Keep tests isolated
5. **Test accessibility** - Include in every component test
6. **Security by default** - Test auth on every endpoint