# @repo/next-config

Consolidated configuration package for ESLint, Prettier, TypeScript, and Next.js configurations.

## Installation

```bash
pnpm add -D @repo/next-config
```

## Usage

### ESLint Configuration

```js
// .eslintrc.js
module.exports = {
  extends: ['@repo/next-config/eslint/next'],
  // or for Node.js projects:
  // extends: ['@repo/next-config/eslint/node'],
  // or for React libraries:
  // extends: ['@repo/next-config/eslint/react'],
}
```

### Prettier Configuration

```js
// prettier.config.js
module.exports = require('@repo/next-config/prettier');
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "@repo/next-config/typescript/nextjs",
  // or for libraries:
  // "extends": "@repo/next-config/typescript/library",
  // or for React libraries:
  // "extends": "@repo/next-config/typescript/react-library",
}
```

### Next.js Configuration

```js
// next.config.js
import { config } from '@repo/next-config';

export default config;

// Or with custom configuration:
import { withPerformance } from '@repo/next-config/next';

const customConfig = {
  // your custom config
};

export default withPerformance(customConfig);
```

## Available Exports

- **ESLint Configs:**
  - `@repo/next-config/eslint` - Base ESLint configuration
  - `@repo/next-config/eslint/next` - Next.js specific ESLint configuration
  - `@repo/next-config/eslint/node` - Node.js specific ESLint configuration
  - `@repo/next-config/eslint/react` - React library ESLint configuration

- **Prettier Config:**
  - `@repo/next-config/prettier` - Prettier configuration with import sorting

- **TypeScript Configs:**
  - `@repo/next-config/typescript/base` - Base TypeScript configuration
  - `@repo/next-config/typescript/library` - Library TypeScript configuration
  - `@repo/next-config/typescript/nextjs` - Next.js TypeScript configuration
  - `@repo/next-config/typescript/react-library` - React library TypeScript configuration

- **Next.js Config:**
  - `@repo/next-config` - Default Next.js configuration with performance optimizations
  - `@repo/next-config/next` - All Next.js configuration exports