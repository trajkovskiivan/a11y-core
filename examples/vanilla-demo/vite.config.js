import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Allow importing from packages directory
  resolve: {
    alias: {
      '@a11ykit/web': resolve(__dirname, '../../packages/web/dist/a11ykit.js'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
});
