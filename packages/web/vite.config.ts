import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'a11yCore',
      formats: ['es', 'iife', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'a11y-core.js';
        if (format === 'iife') return 'a11y-core.iife.js';
        return 'a11y-core.umd.cjs';
      },
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
