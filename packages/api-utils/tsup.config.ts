import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/errors.ts', 'src/responses.ts', 'src/validation.ts', 'src/middleware.ts'],
  format: ['esm'],
  dts: false, // Disable for now due to monorepo path issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@repo/observability', '@repo/security', '@repo/auth'],
});