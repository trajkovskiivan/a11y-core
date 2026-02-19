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
      formats: ['es', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'compa11y.js';
        return 'compa11y.iife.js';
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
    sourcemap: false,
    minify: 'esbuild',
  },
});
