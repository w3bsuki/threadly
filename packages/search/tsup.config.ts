import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client/index.ts', 'src/search-webhook-client.ts'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      incremental: false,
      composite: false,
      tsBuildInfoFile: undefined
    }
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'lucide-react'],
});