# @repo/typescript-config

Shared TypeScript configuration for the monorepo.

## Installation

This package is part of the monorepo and should be installed as a workspace dependency:

```json
{
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  }
}
```

## Available Configurations

### Base Configuration (`base.json`)

The foundation configuration with strict TypeScript settings:

```json
{
  "extends": "@repo/typescript-config/base"
}
```

Features:
- ES2022 target
- Strict mode enabled
- No unused locals/parameters
- No unchecked indexed access
- Incremental compilation

### Next.js Configuration (`nextjs.json`)

For Next.js applications:

```json
{
  "extends": "@repo/typescript-config/nextjs"
}
```

Features:
- Includes DOM types
- JSX preserve mode
- Next.js plugin support
- Common path aliases configured
- `.next` types included

### React Library Configuration (`react-library.json`)

For React component libraries:

```json
{
  "extends": "@repo/typescript-config/react-library"
}
```

Features:
- React JSX runtime
- Declaration files generation
- Source maps
- Test files excluded

### Node.js Configuration (`node.json`)

For Node.js services and scripts:

```json
{
  "extends": "@repo/typescript-config/node"
}
```

Features:
- NodeNext module resolution
- Node types included
- Source maps
- Declaration files

## Usage Examples

### Next.js App

```json
{
  "extends": "@repo/typescript-config/nextjs",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### React Component Package

```json
{
  "extends": "@repo/typescript-config/react-library",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

### Node.js Service

```json
{
  "extends": "@repo/typescript-config/node",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

## Customization

You can override any settings from the base configurations:

```json
{
  "extends": "@repo/typescript-config/base",
  "compilerOptions": {
    "target": "ES2023",
    "noUnusedLocals": false
  }
}
```