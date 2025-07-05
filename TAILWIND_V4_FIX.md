# Tailwind v4 CSS Not Loading - Root Cause & Fix

## Problem
The web app at port 3001 had no styling - all Tailwind CSS classes were being applied to HTML elements but the CSS wasn't being generated.

## Root Cause
When using Tailwind v4 with a monorepo setup, the PostCSS configuration wasn't being properly exported from the shared design-system package. The web app was trying to import:
- `@repo/design-system/postcss.config.mjs`
- `@repo/design-system/styles/globals.css`

But these files weren't listed in the package.json exports field.

## Fix Applied

### 1. Added PostCSS config export to design-system package.json:
```json
"exports": {
  // ... other exports
  "./postcss.config.mjs": "./postcss.config.mjs",
  "./styles/globals.css": "./styles/globals.css"
}
```

### 2. PostCSS Configuration
The PostCSS config in `packages/design-system/postcss.config.mjs` is minimal:
```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### 3. CSS Import Structure
- `packages/design-system/styles/globals.css` has `@import "tailwindcss";`
- `apps/web/app/[locale]/styles.css` imports the design-system globals
- `apps/web/app/[locale]/layout.tsx` imports `./styles.css`

## Key Learnings
1. **Tailwind v4 uses a different approach** - No tailwind.config.js file, uses `@import "tailwindcss"` instead
2. **Package exports are critical** - In monorepos, all imported files must be explicitly exported
3. **PostCSS plugin order matters** - `@tailwindcss/postcss` must be before autoprefixer
4. **The @source directive** in CSS files tells Tailwind v4 where to look for classes

## Symptoms When Broken
- HTML has all the right classes (bg-white, max-w-7xl, etc.)
- But the page has no styling at all
- CSS file only contains font imports, no Tailwind utilities
- No build errors - just missing styles

## How to Verify Fix
1. Check that classes like `bg-white`, `border-gray-200` are working
2. Inspect CSS file - should contain compiled Tailwind utilities
3. Page should have proper styling, not just raw HTML