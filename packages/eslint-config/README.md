# @repo/eslint-config

Shared ESLint configuration for the Threadly monorepo.

## Usage

### Installation

This package is already included as a workspace dependency. No additional installation needed.

### Configuration

Add to your `.eslintrc.json` or `eslint.config.js`:

#### For Next.js applications

```json
{
  "extends": ["@repo/eslint-config/next"]
}
```

#### For React libraries

```json
{
  "extends": ["@repo/eslint-config/react"]
}
```

#### For Node.js applications

```json
{
  "extends": ["@repo/eslint-config/node"]
}
```

#### For general TypeScript projects

```json
{
  "extends": ["@repo/eslint-config"]
}
```

## Configurations

### Base Configuration (`index.js`)

- TypeScript support with strict type checking
- Import sorting and organization
- No console.log in production
- Prefer const/let over var
- Object shorthand and template literals
- No nested ternaries
- Consistent type imports

### Next.js Configuration (`next.js`)

- Extends base configuration
- Next.js Core Web Vitals rules
- React and React Hooks rules
- JSX formatting and best practices
- Allows default exports for Next.js app directory files

### React Configuration (`react.js`)

- Extends base configuration
- React best practices
- React Hooks rules
- JSX accessibility rules
- Component definition consistency

### Node.js Configuration (`node.js`)

- Extends base configuration
- Node.js specific rules
- Async/Promise best practices
- Security rules
- Error handling
- Performance optimizations

## Rules Overview

### TypeScript

- `@typescript-eslint/no-explicit-any`: Error - No any types allowed
- `@typescript-eslint/consistent-type-imports`: Error - Use type imports
- `@typescript-eslint/no-unused-vars`: Error - No unused variables

### Imports

- Organized import groups with proper sorting
- `@repo/*` packages grouped as internal
- No duplicate imports
- No circular dependencies

### Code Quality

- No console.log (except warn/error)
- No debugger statements
- Prefer const over let
- Use object shorthand
- Use template literals
- Use arrow functions

### React (Next.js/React configs)

- Proper JSX key usage
- Self-closing components
- Sorted props
- No array index as key
- Exhaustive deps in hooks

## Customization

You can extend or override rules in your local ESLint configuration:

```json
{
  "extends": ["@repo/eslint-config/next"],
  "rules": {
    // Your custom rules
  }
}
```