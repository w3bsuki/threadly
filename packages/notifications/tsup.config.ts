import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/templates/index.ts',
    'src/realtime/index.ts',
    'src/realtime/client/index.ts',
    'src/realtime/server/index.ts',
  ],
  format: ['esm'],
  dts: {
    compilerOptions: {
      incremental: false,
      composite: false,
      tsBuildInfoFile: undefined,
    },
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});