# Design System Migration Plan

## Executive Summary

This document outlines the systematic migration plan for implementing the Threadly Design System across all applications. The migration will ensure consistency, improve maintainability, and enhance the user experience across all touchpoints.

---

## 1. Current State Analysis

### ✅ What's Already Using Design System

**Well-Adopted Areas:**
- **Component Imports**: 268 files properly import from `@repo/design-system`
- **Typography**: No custom font declarations found (using Geist fonts system-wide)
- **Core Components**: Button, Card, Input, and other UI components consistently used
- **Theme Support**: Light/dark mode properly implemented in most areas

**Adoption by App:**
| Application | Adoption Level | Files Using DS | Notes |
|------------|---------------|----------------|-------|
| Web App | 85% | 245 | Main app, mostly compliant |
| App App | 90% | 20 | Mobile-first app, good adoption |
| API App | 10% | 1 | Minimal UI, only error pages |
| Storybook | 100% | All | Fully compliant |
| Docs | 60% | 3 | Documentation site |

### ❌ What Needs Migration

**Color Values:**
- **15 files** with hardcoded Tailwind colors (`bg-black`, `text-white`, etc.)
- **3 files** with hex color values (#000000, #FFFFFF)
- **1 file** with rgba values

**Spacing/Layout:**
- Generally good adoption
- Some responsive image sizing using pixels (acceptable)

**Specific Problem Areas:**
1. `apps/web/components/navigation/integrated-filters.tsx` - Hardcoded color swatches
2. `apps/web/app/[locale]/styles.css` - RGBA opacity values
3. `apps/web/components/navigation/components/user-actions.tsx` - Direct color classes
4. Various files using `bg-gray-*` instead of semantic tokens

---

## 2. Priority Matrix

### High Priority (Business Critical)
- **P0**: Customer-facing components with hardcoded values
- **P0**: Navigation components (affect all pages)
- **P0**: Authentication flows

### Medium Priority (User Experience)
- **P1**: Product listing pages
- **P1**: Shopping cart components
- **P1**: User profile sections

### Low Priority (Internal/Admin)
- **P2**: Admin dashboard
- **P2**: Error pages
- **P2**: Documentation site

### Migration Effort vs Impact Matrix

```
High Impact
    │
    │ [Navigation]     [Product Pages]
    │ [Auth Forms]     [Cart/Checkout]
    │
    │ [User Profile]   [Search]
    │ [Filters]        
    │
    │ [Admin]          [Docs]
    │ [Errors]         
    │
    └─────────────────────────────> High Effort
      Low                    High
```

---

## 3. Migration Phases

### Phase 1: Foundation (Week 1)
**Goal**: Establish patterns and migrate critical paths

1. **Update Build Tools**
   - Ensure all apps have correct design system imports
   - Update TypeScript configs to recognize token types
   - Add design token validation to CI/CD

2. **Migrate Navigation Components**
   - `unified-bottom-nav.tsx`
   - `integrated-filters.tsx`
   - `user-actions.tsx`
   - All header/footer components

3. **Create Migration Utilities**
   - Color mapping script (Tailwind → Design tokens)
   - Spacing converter tool
   - Component wrapper for gradual migration

### Phase 2: Core Features (Week 2-3)
**Goal**: Migrate primary user flows

1. **Authentication & Onboarding**
   - Sign in/up forms
   - Password reset flows
   - User onboarding

2. **Product Experience**
   - Product cards
   - Product detail pages
   - Category pages
   - Search results

3. **Commerce Flow**
   - Shopping cart
   - Checkout process
   - Order confirmation

### Phase 3: Extended Features (Week 4)
**Goal**: Complete remaining user-facing features

1. **User Account**
   - Profile pages
   - Settings
   - Order history
   - Wishlists

2. **Messaging & Social**
   - Chat interfaces
   - Notifications
   - Reviews/ratings

3. **Marketing Pages**
   - Landing pages
   - About/Contact
   - Help center

### Phase 4: Admin & Internal (Week 5)
**Goal**: Migrate internal tools

1. **Admin Dashboard**
   - Analytics views
   - User management
   - Content management

2. **Error Pages**
   - 404/500 pages
   - Maintenance pages

3. **Documentation**
   - API docs
   - Component docs

### Phase 5: Polish & Optimization (Week 6)
**Goal**: Ensure consistency and performance

1. **Audit & Cleanup**
   - Remove unused styles
   - Optimize token usage
   - Bundle size analysis

2. **Performance Testing**
   - Measure render performance
   - Optimize critical CSS
   - Lazy load non-critical styles

---

## 4. File-by-File Checklist

### Critical Files (P0)

#### Navigation Components
- [ ] `/apps/web/components/navigation/unified-bottom-nav.tsx`
  - Replace Tailwind color classes with semantic tokens
  - Update spacing to use design system scale
  
- [ ] `/apps/web/components/navigation/integrated-filters.tsx`
  - Replace hex color values (#000000, #FFFFFF, etc.)
  - Use color picker with design system colors
  
- [ ] `/apps/web/components/navigation/components/user-actions.tsx`
  - Replace `bg-black text-white hover:bg-gray-800`
  - Use Button component variants

#### Global Styles
- [ ] `/apps/web/app/[locale]/styles.css`
  - Replace `rgba(0, 0, 0, 0.1)` with opacity utilities
  - Audit all custom CSS for token opportunities

### Component Files (P1)

#### Search Components
- [ ] `/apps/web/components/search/instant-search-provider.tsx`
- [ ] `/apps/web/components/search/filters/mobile-filters.tsx`
- [ ] Files using `bg-gray-*` classes:
  - [ ] Replace with `bg-muted`, `bg-secondary`, etc.

### Utility Updates

#### Color Mappings
```typescript
// Old → New mappings
'bg-black' → 'bg-primary'
'bg-white' → 'bg-background'
'bg-gray-50' → 'bg-muted'
'bg-gray-100' → 'bg-secondary'
'bg-gray-800' → 'bg-primary-foreground'
'text-black' → 'text-foreground'
'text-white' → 'text-primary-foreground'
'text-gray-500' → 'text-muted-foreground'
```

---

## 5. Testing Strategy

### Unit Testing
```typescript
// Test design token usage
describe('Design System Compliance', () => {
  it('should not contain hardcoded colors', () => {
    const file = readFileSync('./component.tsx', 'utf8');
    expect(file).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(file).not.toMatch(/rgb\(/);
    expect(file).not.toMatch(/bg-black|bg-white/);
  });

  it('should use design system imports', () => {
    expect(file).toMatch(/@repo\/design-system/);
    expect(file).not.toMatch(/shadcn\/ui/);
  });
});
```

### Visual Regression Testing
1. **Chromatic Integration**
   - Capture baseline screenshots pre-migration
   - Run visual diffs after each component update
   - Flag any unintended changes

2. **Theme Testing**
   - Verify light/dark mode consistency
   - Test color contrast ratios
   - Validate focus states

### Accessibility Testing
```typescript
// Automated a11y checks
describe('Accessibility Compliance', () => {
  it('should meet WCAG color contrast', async () => {
    const results = await axe(component);
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper focus indicators', () => {
    // Test focus-visible states
  });
});
```

### Performance Testing
- Measure CSS bundle size before/after
- Test paint performance metrics
- Validate no layout shifts from token changes

---

## 6. Performance Benchmarks

### Metrics to Track

#### Before Migration (Baseline)
```javascript
{
  cssSize: {
    total: "145KB",
    critical: "28KB",
    nonCritical: "117KB"
  },
  performance: {
    FCP: "1.2s",
    LCP: "2.1s",
    CLS: "0.08",
    TBT: "210ms"
  },
  customStyles: {
    inlineStyles: 47,
    customCSS: 12,
    utilityClasses: 892
  }
}
```

#### Target After Migration
```javascript
{
  cssSize: {
    total: "120KB", // -17% reduction
    critical: "22KB", // -21% reduction
    nonCritical: "98KB"
  },
  performance: {
    FCP: "1.0s", // -16% improvement
    LCP: "1.8s", // -14% improvement
    CLS: "0.05", // -37% improvement
    TBT: "150ms" // -28% improvement
  },
  customStyles: {
    inlineStyles: 0, // Eliminated
    customCSS: 3, // Minimal edge cases
    utilityClasses: 650 // Reduced by using semantic classes
  }
}
```

### Measurement Tools
1. **Bundle Analysis**: `pnpm analyze`
2. **Lighthouse CI**: Automated performance testing
3. **Custom Metrics**: Token usage analytics

---

## 7. Team Guidelines

### For Developers

#### ✅ DO's
```typescript
// Use semantic tokens
<div className="bg-background text-foreground">

// Use design system components
import { Button } from '@repo/design-system/components';

// Use CSS variables for custom styles
style={{ padding: 'var(--space-4)' }}

// Follow component patterns
<Card className="p-6">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### ❌ DON'Ts
```typescript
// Don't use hardcoded colors
<div className="bg-black text-white">

// Don't import from node_modules directly
import { Button } from 'shadcn/ui';

// Don't use arbitrary values
style={{ padding: '18px' }}

// Don't create custom variants
<button className="px-4 py-2 bg-blue-500">
```

### For Designers

1. **Use Token Names in Specs**
   - Specify `color-primary` not `#000000`
   - Reference `space-4` not `16px`

2. **Maintain Token Documentation**
   - Document any new tokens needed
   - Provide migration notes for deprecated tokens

3. **Collaborate on New Patterns**
   - Propose new components through design system
   - Avoid one-off custom designs

### Code Review Checklist

- [ ] No hardcoded color values
- [ ] No arbitrary spacing values
- [ ] Imports from `@repo/design-system`
- [ ] Semantic token usage
- [ ] Proper theme support
- [ ] Accessible color contrast
- [ ] No custom CSS unless absolutely necessary

### Migration Helpers

#### ESLint Rules
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['**/node_modules/**'],
      paths: [{
        name: 'tailwindcss',
        message: 'Use design system tokens instead'
      }]
    }],
    'no-hardcoded-colors': 'error',
    'prefer-design-tokens': 'warn'
  }
};
```

#### VS Code Snippets
```json
{
  "Design System Component": {
    "prefix": "dsc",
    "body": [
      "import { $1 } from '@repo/design-system/components';",
      "",
      "export function $2() {",
      "  return (",
      "    <$1 className=\"$3\">",
      "      $0",
      "    </$1>",
      "  );",
      "}"
    ]
  }
}
```

### Monitoring & Maintenance

1. **Weekly Reviews**
   - Check migration progress
   - Address blockers
   - Update timeline if needed

2. **Token Usage Analytics**
   - Track adoption metrics
   - Identify unused tokens
   - Monitor custom style creep

3. **Continuous Improvement**
   - Gather developer feedback
   - Refine migration tools
   - Update documentation

---

## Appendix: Quick Reference

### Token Cheat Sheet
```css
/* Colors */
background → var(--color-background)
foreground → var(--color-foreground)
primary → var(--color-primary)
muted → var(--color-muted)

/* Spacing */
p-4 → padding: var(--space-4)
m-6 → margin: var(--space-6)
gap-8 → gap: var(--space-8)

/* Typography */
text-sm → font-size: var(--font-size-sm)
font-bold → font-weight: var(--font-weight-bold)

/* Borders */
rounded-lg → border-radius: var(--radius-lg)
border → border-width: var(--border-width-1)

/* Shadows */
shadow-md → box-shadow: var(--shadow-md)
```

### Migration Scripts

```bash
# Find hardcoded colors
rg '#[0-9a-fA-F]{6}|rgb\(|hsl\(' --type tsx

# Find Tailwind color classes
rg 'bg-(black|white|gray|red|blue)' --type tsx

# Find arbitrary values
rg 'p-\[|m-\[|w-\[|h-\[' --type tsx

# Generate migration report
pnpm run design-system:audit
```

---

This migration plan is a living document. Update it as you progress through the migration and discover new patterns or challenges.