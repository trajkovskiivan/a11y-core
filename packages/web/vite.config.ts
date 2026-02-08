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
      name: 'A11yKit',
      formats: ['es', 'iife', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'a11ykit.js';
        if (format === 'iife') return 'a11ykit.iife.js';
        return 'a11ykit.umd.cjs';
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
