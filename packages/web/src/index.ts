/**
 * @a11ykit/web
 *
 * Accessible Web Components for any HTML page
 *
 * Usage via CDN:
 * <script src="https://unpkg.com/@a11ykit/web"></script>
 *
 * Or import specific components:
 * import '@a11ykit/web/dialog';
 */

// Components - importing auto-registers them as custom elements
import { A11yDialog } from './components/dialog';
import { A11yMenu } from './components/menu';
import { A11yTabs } from './components/tabs';
import { A11yCombobox } from './components/combobox';

// Re-export components
export { A11yDialog, A11yMenu, A11yTabs, A11yCombobox };

// Core utilities for vanilla JS usage
import {
  // Announcer
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  announceStatus,
  announceError,
  // Focus
  initFocusVisible,
  createFocusTrap,
  createFocusScope,
  createRovingTabindex,
  // Keyboard
  createKeyboardManager,
  KeyboardPatterns,
  createTypeAhead,
  // ARIA
  aria,
  buildAriaProps,
  hasAccessibleName,
  // Platform
  isBrowser,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
} from '@a11ykit/core';

// Re-export core utilities
export {
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  announceStatus,
  announceError,
  initFocusVisible,
  createFocusTrap,
  createFocusScope,
  createRovingTabindex,
  createKeyboardManager,
  KeyboardPatterns,
  createTypeAhead,
  aria,
  buildAriaProps,
  hasAccessibleName,
  isBrowser,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
};

// Initialize core systems when script loads
if (typeof window !== 'undefined') {
  const init = () => {
    initAnnouncer();
    initFocusVisible();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose on window for CDN usage (IIFE bundle)
  // This allows: A11yKit.announcePolite('message')
  (window as any).A11yKit = {
    // Components (classes)
    A11yDialog,
    A11yMenu,
    A11yTabs,
    A11yCombobox,
    // Announcer utilities
    initAnnouncer,
    announce,
    announcePolite,
    announceAssertive,
    announceStatus,
    announceError,
    // Focus utilities
    initFocusVisible,
    createFocusTrap,
    createFocusScope,
    createRovingTabindex,
    // Keyboard utilities
    createKeyboardManager,
    KeyboardPatterns,
    createTypeAhead,
    // ARIA utilities
    aria,
    buildAriaProps,
    hasAccessibleName,
    // Platform detection
    isBrowser,
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
  };
}
