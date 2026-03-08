/**
 * Ambient declaration for process.env.NODE_ENV.
 * tsup/esbuild replaces this at build time; this file makes TypeScript happy.
 */
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
  };
};
