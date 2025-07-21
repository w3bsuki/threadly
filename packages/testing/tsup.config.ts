import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/helpers/index.ts', 'src/mocks/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    'react', 
    'react-dom', 
    'vitest', 
    '@testing-library/react',
    '@testing-library/dom',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    'axe-core',
    '@axe-core/react'
  ],
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  esbuildOptions(options) {
    options.jsx = 'transform';
    options.jsxFactory = 'React.createElement';
    options.jsxFragment = 'React.Fragment';
  },
});