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
      name: 'compa11y',
      formats: ['es', 'iife', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'compa11y.js';
        if (format === 'iife') return 'compa11y.iife.js';
        return 'compa11y.umd.cjs';
      },
    },
    rollupOptions: {
      external: ['@compa11y/core'],
      output: {
        globals: {
          '@compa11y/core': 'compa11yCore',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
