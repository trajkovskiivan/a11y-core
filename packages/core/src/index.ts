/**
 * @a11y-core/core
 *
 * Framework-agnostic accessibility primitives
 *
 * This package provides the foundational utilities used by all
 * a11y-core packages (React, Web Components, etc.)
 */

// Types
export * from './types';

// Utilities
export * from './utils/id';
export * from './utils/dom';
export * from './utils/platform';

// Focus Management
export * from './focus';

// Keyboard Navigation
export * from './keyboard';

// Screen Reader Announcements
export * from './announcer';

// ARIA Utilities
export * from './aria';

// Development Tools
export * from './dev';

/**
 * Initialize all a11y-core systems
 * Call this once at app startup for optimal behavior
 */
export function initA11yKit(): () => void {
  const cleanups: Array<() => void> = [];

  // Dynamic imports to support tree-shaking
  // These are safe because they're from this package
  import('./focus').then(({ initFocusVisible }) => {
    cleanups.push(initFocusVisible());
  });

  import('./announcer').then(({ initAnnouncer }) => {
    cleanups.push(initAnnouncer());
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
