# Design System Migration Quick Start

## 🚀 Getting Started

### Step 1: Run the Audit
First, understand what needs to be migrated:

```bash
# Audit entire codebase
pnpm design-system:audit

# Audit specific app
pnpm design-system:audit --app web

# Focus on specific issues
pnpm design-system:audit --category colors

# Get JSON output for CI
pnpm design-system:audit --json > audit-report.json
```

### Step 2: Review Priority Files
Check the audit report and focus on:
1. Files with the most violations
2. Error severity issues first
3. Customer-facing components

### Step 3: Run Automated Migration
Preview what will be changed:

```bash
# Dry run with details
pnpm design-system:migrate:dry apps/web/components/navigation

# Run actual migration on a file
pnpm design-system:migrate apps/web/components/navigation/user-actions.tsx

# Migrate entire directory
pnpm design-system:migrate apps/web/components
```

### Step 4: Manual Migration
For files that need manual attention:

#### Hex Colors in Filters
```tsx
// Before
const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' }
];

// After
const colors = [
  { name: 'Black', value: 'var(--color-primary)' },
  { name: 'White', value: 'var(--color-background)' }
];
```

#### RGBA Values
```css
/* Before */
box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);

/* After */
box-shadow: 0 0 0 3px var(--color-foreground/10);
```

#### Inline Styles
```tsx
// Before
<div style={{ padding: '16px', margin: '8px' }}>

// After
<div style={{ padding: 'var(--space-4)', margin: 'var(--space-2)' }}>
```

### Step 5: Test Your Changes
1. **Visual Check**: Run the app and verify UI looks correct
2. **Theme Test**: Toggle between light/dark modes
3. **Responsive Test**: Check mobile/desktop layouts
4. **A11y Test**: Run `pnpm test:a11y`

### Step 6: Commit Your Changes
```bash
# Stage your changes
git add -p

# Commit with clear message
git commit -m "refactor: migrate [component] to design system tokens

- Replace hardcoded colors with semantic tokens
- Update spacing to use design system scale
- Ensure theme compatibility"
```

## 📋 Common Patterns

### Color Migrations
```typescript
// Tailwind → Design System
'bg-black' → 'bg-primary'
'bg-white' → 'bg-background'
'text-gray-500' → 'text-muted-foreground'
'border-gray-300' → 'border-border'
```

### Spacing Migrations
```typescript
// Pixels → Tokens
'p-4' → 'p-[var(--space-4)]' // or keep as p-4 if using Tailwind
'gap: 16px' → 'gap: var(--space-4)'
'margin: 8px' → 'margin: var(--space-2)'
```

### Component Migrations
```typescript
// Custom → Design System
<button className="px-4 py-2 bg-black text-white rounded">
  ↓
import { Button } from '@repo/design-system/components';
<Button variant="default">
```

## 🛡️ Safety Checks

Before pushing your changes:

1. ✅ No TypeScript errors: `pnpm typecheck`
2. ✅ No lint errors: `pnpm lint`
3. ✅ Tests pass: `pnpm test`
4. ✅ No new audit violations: `pnpm design-system:audit`

## 🤝 Need Help?

- Check `DESIGN_SYSTEM_MIGRATION_PLAN.md` for detailed guidance
- Review Storybook for component examples
- Ask in #design-system Slack channel

## 🎯 Quick Wins

Start with these easy migrations:
1. `user-actions.tsx` - Simple color replacements
2. Navigation components - High visibility improvements
3. Button components - Use design system Button

Remember: Small, incremental changes are better than large, risky refactors!