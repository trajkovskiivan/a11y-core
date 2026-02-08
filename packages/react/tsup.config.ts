import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/dialog/index': 'src/components/dialog/index.ts',
    'components/menu/index': 'src/components/menu/index.ts',
    'components/tabs/index': 'src/components/tabs/index.ts',
    'components/toast/index': 'src/components/toast/index.ts',
    'components/combobox/index': 'src/components/combobox/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
