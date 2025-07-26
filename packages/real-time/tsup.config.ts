import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client/index.ts', 'src/server/index.ts'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      incremental: false,
      composite: false,
      tsBuildInfoFile: undefined
    },
    resolve: true
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@prisma/client', '.prisma/client', '@repo/database'],
});