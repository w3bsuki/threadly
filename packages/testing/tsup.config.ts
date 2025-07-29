import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/setup.ts',
    'src/helpers/index.ts',
    'src/mocks/index.ts',
    'src/a11y/index.ts',
  ],
  format: ['esm'],
  dts: {
    compilerOptions: {
      incremental: false,
      composite: false,
      tsBuildInfoFile: undefined,
    },
    resolve: true,
  },
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
    '@axe-core/react',
    'jsdom',
    'msw',
    'supertest',
    '@repo/database',
    '@repo/database',
    '@repo/error-handling',
    '@prisma/client',
    '.prisma/client',
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
