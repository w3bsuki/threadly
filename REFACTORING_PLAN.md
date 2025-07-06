# Threadly Refactoring Plan - Next-Forge Best Practices

This document outlines a comprehensive refactoring plan to align the Threadly codebase with next-forge best practices. The refactoring is organized into phases to ensure a smooth transition without breaking existing functionality.

## Executive Summary

Threadly is a premium C2C fashion marketplace built with Next.js 15, TypeScript, and Turborepo. While the codebase follows many good practices, there are opportunities to improve code organization, reduce duplication, and better align with next-forge patterns.

## Current State Analysis

### ✅ What's Already Good
- Proper monorepo structure with Turborepo
- Clear separation between apps (web, app, api)
- Shared packages for common functionality
- TypeScript throughout
- Modern Next.js 15 patterns

### ❌ Areas for Improvement
1. **Code Duplication**: UI components and business logic duplicated across apps
2. **Misplaced Logic**: Business logic mixed with UI in app folders
3. **Inconsistent Patterns**: Different approaches to similar problems (e.g., cart management)
4. **Unused Dependencies**: Legacy scripts and configurations
5. **Incomplete Centralization**: Some shared components still living in apps

## Phase 1: Foundation & Quick Wins (Week 1)

### 1.1 Move Shared UI Components to Design System
**Priority**: High
**Effort**: Medium

Components to migrate:
- `skeletons.tsx` (from both apps/web and apps/app)
- `cart-content.tsx` and related cart components
- `messages-content.tsx`
- `search-results.tsx`
- Product display components (cards, grids)

**Action Items**:
```bash
# Move components to packages/design-system/components/
- commerce/
  - cart-content.tsx
  - cart-dropdown.tsx
  - product-card.tsx
  - product-grid.tsx
- messaging/
  - messages-content.tsx
- search/
  - search-results.tsx
- feedback/
  - skeletons.tsx (unified version)
```

### 1.2 Standardize Utility Functions
**Priority**: High
**Effort**: Low

Utilities to centralize:
- `formatCurrency` (create single implementation in @repo/utils)
- `useDebounce` hook
- Date formatting utilities
- Price calculations

**Action Items**:
```typescript
// packages/utils/src/currency.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// packages/utils/src/hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  // Implementation
}
```

### 1.3 Clean Up Scripts and Configurations
**Priority**: Medium
**Effort**: Low

Files to review and potentially remove:
- `check-images.js`
- `test-search-webhook.js`
- Legacy seed scripts that are duplicated
- Unused configuration files

## Phase 2: Business Logic Extraction (Week 2)

### 2.1 Create Commerce Package
**Priority**: High
**Effort**: High

Create `packages/commerce` for shared e-commerce logic:
- Cart management (unify useCartSync and useCartStore)
- Checkout flows
- Order management
- Product queries
- Pricing logic

**Structure**:
```
packages/commerce/
├── cart/
│   ├── store.ts
│   ├── hooks.ts
│   └── types.ts
├── checkout/
│   ├── actions.ts
│   └── types.ts
├── products/
│   ├── queries.ts
│   └── types.ts
└── index.ts
```

### 2.2 Extract Search Functionality
**Priority**: Medium
**Effort**: Medium

Create `packages/search` for unified search logic:
- Search hooks
- Search history management
- Autocomplete functionality
- Search result processing

### 2.3 Messaging Package
**Priority**: Medium
**Effort**: Medium

Create `packages/messaging` for chat functionality:
- Message types and interfaces
- Real-time message handling
- Conversation management

## Phase 3: Environment & Configuration (Week 3)

### 3.1 Centralize Environment Variables
**Priority**: High
**Effort**: Medium

Current state: Each app has its own env.ts
Goal: Centralized validation with package-specific schemas

**Action Items**:
1. Audit all env vars across apps
2. Remove unused variables
3. Create package-specific env schemas
4. Document all required variables

### 3.2 Deployment Configuration
**Priority**: Medium
**Effort**: Low

- Review and simplify next.config.ts files
- Remove unused build configurations
- Ensure Vercel/deployment configs are minimal

## Phase 4: Testing & Documentation (Week 4)

### 4.1 Add Missing Tests
**Priority**: High
**Effort**: High

Areas needing tests:
- Business logic in new packages
- Critical user flows
- API endpoints
- Shared components

### 4.2 Documentation Updates
**Priority**: Medium
**Effort**: Medium

- Update README files for each package
- Document new package APIs
- Create onboarding guide
- Update architecture diagrams

## Phase 5: Advanced Optimizations (Week 5)

### 5.1 Performance Improvements
**Priority**: Medium
**Effort**: High

- Implement proper caching strategies
- Optimize database queries
- Add proper error boundaries
- Implement progressive enhancement

### 5.2 Accessibility Audit
**Priority**: Medium
**Effort**: Medium

- Audit all UI components for a11y
- Add proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### 5.3 Internationalization Consistency
**Priority**: Low
**Effort**: Medium

- Audit i18n implementation
- Ensure all user-facing text is translatable
- Standardize locale handling

## Implementation Guidelines

### Do's
- ✅ Test thoroughly after each refactoring step
- ✅ Keep PRs small and focused
- ✅ Maintain backward compatibility during transition
- ✅ Document breaking changes
- ✅ Run type checking after each change

### Don'ts
- ❌ Don't refactor everything at once
- ❌ Don't remove dependencies without verification
- ❌ Don't break existing functionality
- ❌ Don't skip testing

## Success Metrics

- **Code Duplication**: < 5% duplicate code across apps
- **Type Coverage**: 100% type safety, no `any` types
- **Test Coverage**: > 80% for business logic
- **Build Time**: < 2 minutes for full build
- **Bundle Size**: Reduced by at least 20%

## Migration Checklist

### Phase 1
- [ ] Migrate skeleton components
- [ ] Migrate cart components
- [ ] Centralize formatCurrency
- [ ] Centralize useDebounce
- [ ] Clean up unused scripts

### Phase 2
- [ ] Create commerce package
- [ ] Migrate cart logic
- [ ] Create search package
- [ ] Create messaging package

### Phase 3
- [ ] Audit environment variables
- [ ] Create centralized env schemas
- [ ] Simplify deployment configs

### Phase 4
- [ ] Add unit tests for packages
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Create migration guide

### Phase 5
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] i18n consistency check

## Risk Mitigation

1. **Breaking Changes**: Use feature flags for gradual rollout
2. **Regression Bugs**: Comprehensive test suite before refactoring
3. **Performance Impact**: Benchmark before and after changes
4. **Team Disruption**: Clear communication and documentation

## Next Steps

1. Review and approve this plan
2. Create tracking issues for each phase
3. Assign team members to specific tasks
4. Set up monitoring for success metrics
5. Begin Phase 1 implementation

## Appendix: Detailed Component Analysis

### Duplicated Components Found

1. **Skeletons**
   - `apps/web/components/skeletons.tsx`
   - `apps/app/components/skeletons.tsx`
   - Different implementations, should be unified

2. **Cart Components**
   - `apps/web/app/[locale]/cart/components/cart-content.tsx`
   - `apps/app/app/(authenticated)/buying/cart/components/cart-content.tsx`
   - Similar functionality, different implementations

3. **Search Results**
   - `apps/web/app/[locale]/search/components/search-results.tsx`
   - `apps/app/app/(authenticated)/search/components/search-results.tsx`
   - Can be unified with proper props

4. **Messages**
   - `apps/web/app/[locale]/messages/components/messages-content.tsx`
   - `apps/app/app/(authenticated)/messages/components/messages-content.tsx`
   - Nearly identical, should be shared

### Utility Duplication

1. **useDebounce**
   - Implemented inline in multiple components
   - Should be in @repo/utils/hooks

2. **formatCurrency**
   - Web app uses centralized version
   - App has inline implementations
   - Needs standardization

### Business Logic in Apps

1. **Cart Management**
   - Web: uses context + localStorage
   - App: uses zustand store
   - Should be unified in commerce package

2. **Search Logic**
   - Duplicated API calls
   - Different caching strategies
   - Should be centralized

This refactoring plan will significantly improve code maintainability, reduce duplication, and align the codebase with next-forge best practices while maintaining the high quality expected of a premium marketplace platform.