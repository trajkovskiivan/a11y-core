// vite.config.ts
import { defineConfig } from 'file:///Users/ivantrajkovski/Desktop/Development/A11yKitJs/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.32/node_modules/vite/dist/node/index.js';
import { resolve } from 'path';
import dts from 'file:///Users/ivantrajkovski/Desktop/Development/A11yKitJs/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.19.32_typescript@5.9.3_vite@5.4.21/node_modules/vite-plugin-dts/dist/index.mjs';
var __vite_injected_original_dirname =
  '/Users/ivantrajkovski/Desktop/Development/A11yKitJs/packages/web';
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, 'src/index.ts'),
      name: 'a11y-core',
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
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaXZhbnRyYWprb3Zza2kvRGVza3RvcC9EZXZlbG9wbWVudC9BMTF5S2l0SnMvcGFja2FnZXMvd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvaXZhbnRyYWprb3Zza2kvRGVza3RvcC9EZXZlbG9wbWVudC9BMTF5S2l0SnMvcGFja2FnZXMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9pdmFudHJhamtvdnNraS9EZXNrdG9wL0RldmVsb3BtZW50L0ExMXlLaXRKcy9wYWNrYWdlcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXG4gICAgICBuYW1lOiAnQTExeUtpdCcsXG4gICAgICBmb3JtYXRzOiBbJ2VzJywgJ2lpZmUnLCAndW1kJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4ge1xuICAgICAgICBpZiAoZm9ybWF0ID09PSAnZXMnKSByZXR1cm4gJ2ExMXlraXQuanMnO1xuICAgICAgICBpZiAoZm9ybWF0ID09PSAnaWlmZScpIHJldHVybiAnYTExeWtpdC5paWZlLmpzJztcbiAgICAgICAgcmV0dXJuICdhMTF5a2l0LnVtZC5janMnO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1gsU0FBUyxvQkFBb0I7QUFDL1ksU0FBUyxlQUFlO0FBQ3hCLE9BQU8sU0FBUztBQUZoQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDRixrQkFBa0I7QUFBQSxJQUNwQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxRQUFRLEtBQUs7QUFBQSxNQUM3QixVQUFVLENBQUMsV0FBVztBQUNwQixZQUFJLFdBQVcsS0FBTSxRQUFPO0FBQzVCLFlBQUksV0FBVyxPQUFRLFFBQU87QUFDOUIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixTQUFTLENBQUM7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
