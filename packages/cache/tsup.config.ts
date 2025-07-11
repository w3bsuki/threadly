import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/env.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
});