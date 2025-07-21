# Threadly Production Refactoring Project

I need to transform my Threadly turborepo from a next-forge template into a production-ready C2C fashion marketplace. The codebase is 97% functionally complete but has critical code quality issues preventing production deployment.

## Current Issues Analysis
- 50+ TypeScript `any` violations (violates project rules)
- Massive components (430+ line headers, 686-line message component)
- Code duplication between apps/app and apps/web
- Next-forge branding artifacts throughout codebase
- Performance issues from heavy re-rendering
- Missing error boundaries and loading states

## Phase 1: Critical TypeScript Fixes (IMMEDIATE)

### Files with `any` violations to fix:
**apps/app:**
- `components/saved-search-dialog.tsx` line 21: `filters?: any`
- `app/[locale]/(authenticated)/messages/components/messages-content.tsx` line 34: `price: any`
- `app/[locale]/(authenticated)/admin/products/actions.ts` line 215: `data: any`
- `app/[locale]/(authenticated)/selling/onboarding/components/*.tsx`: Multiple `onUpdate: (data: any)` callbacks

**apps/web:**
- `lib/hooks/use-checkout.ts` line 11: `calculateCosts(items: any[])`
- `components/product-grid-client.tsx` line 351: `updateFilter(key, value: any)`
- `app/[locale]/checkout/components/checkout-content.tsx` lines 70, 542: `orderData: any`

### Required interfaces to create:
1. Create `packages/validation/src/schemas/search-filters.ts` with SearchFilters interface
2. Create `packages/validation/src/schemas/common-types.ts` with Price, Dictionary, FormData, OrderData interfaces
3. Create enums for ProductCondition, ProductStatus, SortOptions

## Phase 2: Component Architecture Refactoring

### Large components to split:
1. **apps/web/app/[locale]/components/header/desktop-header.tsx** (265 lines)
   - Extract: SearchBar, CategoriesDropdown, ActionButtons
   - Remove duplicated categories logic

2. **apps/web/app/[locale]/components/header/mobile-header.tsx** (277 lines)  
   - Extract: MobileMenu, MobileCategoriesNav, MobileActions
   - Remove duplicated categories logic

3. **apps/app/app/[locale]/(authenticated)/messages/components/messages-content.tsx** (686 lines)
   - Extract: ConversationList, ChatArea, MessageInput, TypingIndicator

### Shared packages to create:
1. **packages/navigation/** - Consolidate navigation logic from both apps
2. **packages/search/src/components/unified-search.tsx** - Merge search implementations

## Phase 3: Branding Update (next-forge → threadly)

### Files needing branding updates:
- `package.json`: Change "name" from "next-forge" to "threadly"
- `scripts/utils.ts`: Update GitHub URL and tempDirName
- `scripts/update.ts`, `scripts/initialize.ts`, `scripts/index.ts`: Update user messages
- `packages/rate-limit/index.ts`: Change default prefix
- `CLAUDE.md`: Update documentation references
- `docs/` directory: Update all next-forge references

## Phase 4: Performance & Polish

### Performance optimizations:
- Add React.memo to refactored components
- Optimize lucide-react imports (tree-shaking)
- Add error boundaries to all async components
- Implement virtualization for large lists
- Add loading skeletons throughout

### Design system compliance:
- Replace hardcoded Tailwind classes with design tokens
- Use @repo/design-system components consistently
- Add proper ARIA labels and accessibility

## Implementation Order

1. **Start with TypeScript fixes** - This unblocks everything else
2. **Create shared packages** - Navigation and search consolidation  
3. **Split large components** - Header and messages refactoring
4. **Update branding** - Systematic next-forge → threadly
5. **Performance optimization** - Memoization, error boundaries, loading states

## Project Rules (CRITICAL)
- NO `any` types allowed (violates CLAUDE.md)
- NO console.log statements
- MUST run `pnpm typecheck` after changes
- Use @repo/* imports exclusively
- Follow existing patterns

## Current Architecture
- Turborepo with apps/app (port 3000) and apps/web (port 3001)
- 30+ packages in packages/ directory
- Next.js 15, TypeScript, Prisma, Clerk auth, Stripe payments
- Tailwind + shadcn/ui design system