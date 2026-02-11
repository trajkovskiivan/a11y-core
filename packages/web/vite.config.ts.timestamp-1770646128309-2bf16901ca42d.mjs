// vite.config.ts
import { defineConfig } from 'file:///Users/ivantrajkovski/Desktop/Development/TrajkTech/Compa11yJs/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.32/node_modules/vite/dist/node/index.js';
import { resolve } from 'path';
import dts from 'file:///Users/ivantrajkovski/Desktop/Development/TrajkTech/Compa11yJs/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.19.32_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-dts/dist/index.mjs';
var __vite_injected_original_dirname =
  '/Users/ivantrajkovski/Desktop/Development/TrajkTech/Compa11yJs/packages/web';
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, 'src/index.ts'),
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
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaXZhbnRyYWprb3Zza2kvRGVza3RvcC9EZXZlbG9wbWVudC9UcmFqa1RlY2gvQTExeUtpdEpzL3BhY2thZ2VzL3dlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2l2YW50cmFqa292c2tpL0Rlc2t0b3AvRGV2ZWxvcG1lbnQvVHJhamtUZWNoL0ExMXlLaXRKcy9wYWNrYWdlcy93ZWIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2l2YW50cmFqa292c2tpL0Rlc2t0b3AvRGV2ZWxvcG1lbnQvVHJhamtUZWNoL0ExMXlLaXRKcy9wYWNrYWdlcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXG4gICAgICBuYW1lOiAnY29tcGExMXknLFxuICAgICAgZm9ybWF0czogWydlcycsICdpaWZlJywgJ3VtZCddLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IHtcbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ2VzJykgcmV0dXJuICdjb21wYTExeS5qcyc7XG4gICAgICAgIGlmIChmb3JtYXQgPT09ICdpaWZlJykgcmV0dXJuICdjb21wYTExeS5paWZlLmpzJztcbiAgICAgICAgcmV0dXJuICdjb21wYTExeS51bWQuY2pzJztcbiAgICAgIH0sXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWydAY29tcGExMXkvY29yZSddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAnQGNvbXBhMTF5L2NvcmUnOiAnY29tcGExMXlDb3JlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1osU0FBUyxvQkFBb0I7QUFDN2EsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sU0FBUztBQUZoQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDRixrQkFBa0I7QUFBQSxJQUNwQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxRQUFRLEtBQUs7QUFBQSxNQUM3QixVQUFVLENBQUMsV0FBVztBQUNwQixZQUFJLFdBQVcsS0FBTSxRQUFPO0FBQzVCLFlBQUksV0FBVyxPQUFRLFFBQU87QUFDOUIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsZ0JBQWdCO0FBQUEsTUFDM0IsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1Asa0JBQWtCO0FBQUEsUUFDcEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
