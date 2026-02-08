import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'focus/index': 'src/focus/index.ts',
    'keyboard/index': 'src/keyboard/index.ts',
    'announcer/index': 'src/announcer/index.ts',
    'aria/index': 'src/aria/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [],
});
