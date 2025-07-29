# @repo/prettier-config

Shared Prettier configuration for the Threadly monorepo.

## Usage

Add to your `package.json`:

```json
{
  "prettier": "@repo/prettier-config"
}
```

## Configuration

This package includes:
- Standard code formatting rules
- Tailwind CSS plugin for class sorting
- Import sorting with logical grouping
- Consistent formatting across all workspaces

## Plugins

- `prettier-plugin-tailwindcss`: Sorts Tailwind CSS classes
- `@trivago/prettier-plugin-sort-imports`: Sorts and groups imports

## Import Order

1. React imports
2. Next.js imports
3. Third-party modules
4. `@repo/*` workspace imports
5. Local imports (`@/*`)
6. Relative imports (`./`, `../`)