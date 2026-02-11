import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Allow importing from packages directory
  resolve: {
    alias: {
      '@compa11y/web': resolve(
        __dirname,
        '../../packages/web/dist/compa11y.js'
      ),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
});
